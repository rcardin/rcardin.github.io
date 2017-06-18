---
layout: post
title:  "A new way to err, Apache Spark"
date:   2016-04-30 21:00:00
comments: true
categories: big-data apache-spark scala programming
tags:
    - big-data
    - apache-spark
    - scala
    - programming
summary: "Apache Spark is a library that let you write code that will be executed in a distributed fashion as a simple single 
          threaded program. Spark will make the dirty job for you: it will distribute the code and the execution, manage remote
          objects for you, optimize the algorithm for you. However, be aware: there is no kind of magic behind Spark. If you
          do not deeply understand the logic behind it, you will discover new way to loss your time searching for incomprehensible 
          bugs."
social-share: true
social-title: "A new way to err, Apache Spark"
social-tags: "big-data, apache-spark, scala, programming"
---

It's been 10 years that I develop in Java, and some years that I know Scala. Surely I do not consider myself a *ninja*,
but I have some notions about programming.

Recently I started to use [Apache Spark](http://spark.apache.org/) for a project I was involved to. In this project we
have to process a huge amount of data (somebody calls such applications as *Big-data*, ;) ) and to accomplish this job 
we have to use some distributed programming on a cluster. 

Apache Spark is a library that let you write code, that will be executed in a distributed fashion, as a simple single 
threaded program. Spark will make the dirty job for you: it will distribute the code and the execution, manage remote
objects for you, optimize the algorithm for you. However, **be aware**: there is no kind of magic behind Spark. If you
do not deeply understand the logic behind it, you will discover new way to loss your time searching for incomprehensible 
bugs.

## Spark distributed data structures

One of the core concepts of Apache Spark is the way it represents distributed data structures. *Resilient Distributed 
Dataset*, a.k.a. `RDD`, is the type that is used by Spark to work with data in a distributed way. `RDD[T]` is a 
invariant *generic* type and in its simplest form can be seen as a distributed implementation of a `List`.

In the book *Learning Spark* `RDD` is defined as follow:

> An RDD in Spark is simply an immutable distributed collection of objects. Each RDD is split into multiple **partitions**, 
  which may be computed on different nodes of the cluster. RDDs can contain any type of Python, Java, or Scala objects, 
  including user defined classes.
  
So, Spark uses to partition data contained in an `RDD` to different nodes. The main node, where the program is started
is called the **driver** node.

On a `RDD` you can do two type of operations, *transformations* and *actions*. Transformations construct a new `RDD` 
from a previous one. For example. `map` and `flatMap` operations are considered a transformations.

{% highlight scala %}
// sc is the Spark context. Using the Spark context it's possible to build RDD from 
// external resources, such as a file
val lines: RDD[String] = sc.textFile("large_file.txt")
val tokens = lines.flatMap(_ split " ")
{% endhighlight %}

Actions compute a result based on an `RDD`, and either return it to the driver program or save it 
to an external storage system (such as HDFS, HBase, ...).

{% highlight scala %}
// Saving token to a partitioned file
tokens.saveAsTextFile("/some/output/file.txt")
{% endhighlight %}

Finally, when you work with `RDD` you have to remember that

> although you can define new RDDs any time, Spark computes them only in a **lazy** fashion —that is, the first time 
  they are used in an action.
  
## Spark and serialization

Using the information given above, it's easy to imagine that Spark does a lot of work on your code. First of all, it 
has to partition the execution of transformations on `RDD`, and then it has to rewrite your code in a way that enables
the laziness.

What we want to analyze in this post is the issue regarding the distribution of the execution of the transformation to 
the workers. As a proof of concepts, take the following code.

{% highlight scala %}
val lines: RDD[String] = sc.textFile("large_file.txt")
val toFind = "Some cool string"
val tokens = 
  lines.flatMap(_ split " ")
       .filter(_.contains(toFind))
{% endhighlight %}
 
First of all we have to operate some distinction between the objects that are used inside the two transformations. Here
we have two kind of objects, which are:

 - The `String`s that are wrapped inside the `RDD`
 - All other objects that are passed in the closures of `flatMap` and `filter`
 
Have you ever heard about Java RMI Specification? The behaviour we are gonna to analyze is very similar to the behaviour
described in the RMI specification. In RMI types are divided in two main subsets: the types that implement the 
`java.rmi.Remote` interface and the types that does not implement this interface.
 
The former are **remote types**, which means that their methods can be accessed remotely, i.e. they can be invoked from
objects that live on nodes in computer network different from the node in which remote objects were instantiated. The
*state* of these objects is shared, which means that all the changes made by a method invoked from a node are visible
to all other nodes that owns a reference to the same remote object. 

*Distributed shared object*, what an hell!!!

The latter are the object that are usually passed as parameters to methods of the remote objects. Let's say that we
have the following remote interface:

{% highlight java %}
public interface Compute extends Remote {
    <T> T executeTask(Task<T> t) throws RemoteException;
}
public class Task<K> {
    // Some cool lines of code
}
{% endhighlight %}

The `Task` type is not a remote object; it is just passed to a method of a remote object. Which is the destiny of 
such types? First of all, they *must* implement the `java.io.Serializable`. Why? Because they will be serialized and 
sent through the network, among server nodes. 

Have I mentioned *serialization*? As you know, each object that is serialized is first of all copied and then 
processed. Returning to the above example, after a `Task` object was serialized and sent to another node, it would not 
have any relation with the original copy. 

*No shared state at all*.

Spark adopt exactly the same behaviour: every object that is not enclosed inside an `RDD` and it is passed to a 
transformation will be strictly serialized and send to worker nodes. It will share no state with the original copy in 
the driver node.

## One line of code to ruin them all

Now that we presented the basic behaviour of Spark, we can return to the object of this article: the new kind of bugs 
you can nicely find using Spark. Let's start from the code.

{% highlight scala %}
val packet = new Packet
val lines: RDD[String] = sc.textFile("large_file.txt")
val tokens = lines.flatMap(_ split " ")
val transformed = tokens.map {
  t =>
    if (t == "42") packet.answer(t)
    new StringBuilder(t)
}
println(transformed.count)
{% endhighlight %}
 
The above code is absolutely senseless, but it helps us to explain what's going on. We would expect that if the file 
contains the string `42`, the value of the attribute `answer` of the object `packet` after the execution of the 
action `transformed.count` shall be `42`, wouldn't we? 

**Wrong**! The `packet` object is not enclosed inside an `RDD`. When it is passed to the `map` transformation, first of 
all it is serialized, and then sent to the worker nodes. Every update to the `packet` object made inside the 
transformation will be lost and not reflected to the copy of the object owned by the driver.

And things can get even worse. Imagine that you want to pass a collection to the closure , let say a `List` of objects. For 
every element of the `RDD` you select an item of the list, modify it and finally create a new `RDD` item that include
that object.

{% highlight scala %}
val packets = new List[Packet] // Initialize the packet list in some ways
val lines: RDD[String] = sc.textFile("large_file.txt")
val tokens = lines.flatMap(_ split " ")
val transformed = tokens.map {
  t =>
    // Choose a packet from the list using some heuristic
    val p = packets(...)
    // Increments by one a packet internal int attribute
    if (t == "42") packet.addOne
    (p, t)
}
println(transformed.count)
{% endhighlight %}

Can you see the madness of the above code? How many different `Packet` object will we have in the `RDD` of couples? One?
Two? One for every token? Probably the more correct answer is *it depends*. 

It depends from how many worker are configured in the cluster and on how many of them have been used to partition the 
original `RDD` during the elaboration. Each worker has a different copy of the `packets` list, and it uses the local 
list to compute the final value. Every change to the `packets` objects is made on the local copy, but then shared with 
the driver through the resulting `RDD`.

And this thing has cost me more or less 4 hours of my life :(

Clearly, the problem is that the above code is not *functional*, which means that it uses object with mutable state and 
the transformation has some *side effects* on its input.
Remove the mutable state, and you will remove (more or less) every code smell.

## On Spark distribution model

The parallelism that I've made between Java RMI and Apache Spark is merely related to the external behaviour seen by 
the developer, and not related to the implementation of Spark. As **Roland Kuhn** wrote in an email that kindly answer 
a question that I have previously made to him

> None of the proper reactive solutions use RMI, that technique is obsolete (search for the difference between 
  transparent remoting and location transparency). In particular Spark does not perform remote calls in the way you 
  think, that would slow it down by orders of magnitude. Instead it serializes the code and sends that to the worker 
  nodes.
  
And that's all, folks!
 
## References
- [Chapter 3: Programming with RDDs. Learning Spark, Holden Karau, Andy Konwinski, Patrick Wendell, Matei Zaharia, 
   2015, O'Reilly Media](http://shop.oreilly.com/product/0636920028512.do)