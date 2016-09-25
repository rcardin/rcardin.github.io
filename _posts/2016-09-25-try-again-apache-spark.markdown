---
layout: post
title:  "Try again, Apache Spark!"
date:   2016-09-25 12:30:00
comments: true
categories: big-data apache-spark scala programming
tags:
    - big-data
    - apache-spark
    - scala
    - programming
summary: "It's been more than a year since I've started working on my first Big Data project. In this project we chose Apache 
          Spark as batch processing framework. Using Apache Spark throws you in a functional, distributed and asynchronous 
          programming world. While you have not to worry about the distributed adjective, because Spark hides you every problem
          related to it, the functional and asynchronous adjectives make things more complex with respect to the error 
          handling process. Let's explain why."
social-share: true
social-title: "Try again, Apache Spark!"
social-tags: "big-data, apache-spark, Scala, programming"
---

It's been more than a year since I've started working on my first Big Data project. In this project we chose **Apache 
Spark** as batch processing framework. Using Apache Spark throws you in a functional, distributed and asynchronous 
programming world. While you have not to worry about the *distributed* adjective, because Spark hides you every problem
related to it, the *functional* and *asynchronous* adjectives make things more complex with respect to the error 
handling process. Let's explain why. 

#### Classical error handling
In classic situations, such as in languages as Java or C++, *exceptions* are used to signal an exceptional behaviour of a program.
If you need to handle an particular type of exception, you will use a `try`-`catch` statement, surrounding the 
statements that can rise the exception. 

{% highlight java %}
try {
    // This method can rise an Exception
    someMethod();
} catch (Exception e) {
    // Handle the exceptional behaviour in some way
}
{% endhighlight %}

In Scala language the above statements become as follow.

{% highlight scala %}
try {
  // This method can rise an Exception
  someMethod
} catch {
  case e: Exception => // Handle the exceptional behaviour in some way
}
{% endhighlight %}

I will not discuss if it is better to use a checked or an unchecked exception in Java. This is not the aim of this post.
The important thing is the **locality** of the statements that handle the exception and the statements that rise the exception.
The latter is inside the scope of the formers.

#### Asynchronous execution and exception handling

Apache Spark uses `RDD` (*Resilient Distributed Datasets*) as the basic block to build algorithms over huge amount 
of data (refer to [A new way to err, Apache Spark](http://rcardin.github.io/big-data/apache-spark/scala/programming/2016/04/30/a-new-way-to-err-apache-spark.html) for a more detailed description).   

On a `RDD` you can do two type of operations, *transformations* and *actions*. Transformations construct a new `RDD` 
from a previous one. For example. `map` and `flatMap` operations are considered a transformations.

{% highlight scala %}
val lines: RDD[String] = sc.textFile("large_file.txt")
val tokens = lines.flatMap(_ split " ")
{% endhighlight %}

Actions compute a result based on an `RDD`, and either return it to the driver program or save it 
to an external storage system (such as HDFS, HBase, ...).

{% highlight scala %}
tokens.saveAsTextFile("/some/output/file.txt")
{% endhighlight %}

Finally, when you work with `RDD` you have to remember that

> although you can define new RDDs any time, Spark computes them only in a **lazy** fashion —that is, the first time 
  they are used in an action.    

During the processing of a transformation on a `RDD`, something can go wrong and an exception can be raised. The first 
attempt to handle the exception is usually to surround the transformation inside a `try`-`catch` statement.
 
{% highlight scala %}
val lines: RDD[String] = sc.textFile("large_file.txt")
try {
  val tokens = 
    lines.flatMap(_ split " ")
         // This transformation can throw an exception
         .map(s => s(10))
} catch {
  case e : StringIndexOutOfBoundsException => 
    // Doing something in response of the exception
}
tokens.saveAsTextFile("/some/output/file.txt")
{% endhighlight %} 

Unfortunately, as stated above, the code inside the transformation will not be really executed until the first action 
was reached. Then, the above code is totally useless regarding the handling of the exceptions. The only thing we can do
if we want to catch exceptions rise during transformations on an `RDD` is to surround actions statements with 
`try`-`catch` statements.
 
{% highlight scala %}
val lines: RDD[String] = sc.textFile("large_file.txt")
val tokens = 
  lines.flatMap(_ split " ")
       .map(s => s(10))
try {
  // This try-catch block catch all the exceptions thrown by the 
  // preceding transformations. 
  tokens.saveAsTextFile("/some/output/file.txt")
} catch {
  case e : StringIndexOutOfBoundsException => 
    // Doing something in response of the exception
}
{% endhighlight %}  
 
As you can see, we have lost completely the **locality** of the exception handling process.

Using this approach we lose which element throw the exception. Furthermore, Spark is used to process huge 
amount of data: are we sure we want to block the whole execution for a single error on a single element of an `RDD`?
  
#### Functional programming and exception handling
A first attempt to resolve the last problem can be to move the `try`-`catch` statement inside the transformation. Then,
the above code will become the following.

{% highlight scala %}
// ...omissis...
val tokens = 
  lines.flatMap(_ split " ")
       .map {
         s =>
           try {
             s(10)
           } catch {
              case e : StringIndexOutOfBoundsException => 
                // What the hell can we return in this case?
           }
       }   // end of map
{% endhighlight %}

Eureka! We gain back the **locality** feature! Unfortunately, doing this way, we encountered a new problem. Remember: a
transformation constructs a new `RDD` from a previous one. The original type of partial function input of the `map` 
transformation was `String => Char`. 

To maintain this signature, we have to return a `Char` or a subtype of it also in the `case` 
statement. What should we chose? Empty character? A special character? You know, every choice can lead something wrong 
in the sooner or later.

What can we do? The only way to exit from this *impasse* is to revamp **monads**. More or less a monad is a generic 
container that enhances with additional properties a simple type. Scala offers at least three different types of monads 
that help us to deal with exceptional situations:

 1. `Option` and its two subclasses, `Some[T]` and `None`. This monad acts like a list of one or zero elements and we 
    can use it when we are not interested in the details of the error situation we can encounter.
 2. `Either` and its two subclasses, `Left[T]` and `Right[K]`. This monad lets you to return two different types of 
    objects, `T` and `K`, respectively in the case of an exceptional behaviour of the process and in the case of a 
    correct behaviour.
 3. `Try` and its two sublcasses, `Success[T]` and `Failure[T]`. This monad is similar to the `Either`. Instead of using
    a generic type `T` for the `Left` subclass, the `Failure` uses always a type that is a subclass of `Throwable`. The 
    `Try` type is available in Scala since version 2.10.
 
Then, if your aim is that of tracing the exceptions rise during the processing of an `RDD` and continuing to elaborate 
value not in error only, the `Try[T]` monad suites perfectly your needs. This amazing type comes with a useful `apply`
factory method on the companion object, that lets you to build a `Success` or `Failure` object directly from the result 
of a computation.

{% highlight scala %}
// ...omissis...
val tokens = 
  lines.flatMap(_ split " ")
       .map (s => Try(s(10)))
{% endhighlight %}

If the computation produces a value, than an object of type `Success[T]` is built, a `Failure` object is built 
otherwise. The types are immutable. The `Failure` type gives access to its attribute `exception`, that contains the 
error rise during computation.

So, your `RDD[T]` will become a `RDD[Try[T]]`. Using this *escamotage*, we can now use the same data structure to forward 
both data and exceptions. That's great!

**Chaining operations**<br/>
Ok, we have a `RDD[Try[T]]`...now what? How can we work with instances of `Try[T]`? Do you remember when I said the this 
type is a monad? Then, we can use the `map` and `flatMap` methods to work proficiently with it.
  
If you have to transform the content of the a `Try` object, you can apply the `map` method. The function will be applied 
only to instances of the `Success` type and the `Failure` ones will be forward during the transformation as they are. 
If you starts with a `Try[A]`, then you will be finished with a `Try[B]`. What if your transformation can create a `Try` 
in turn? Using the `map` method you will obtain a `Try[Try[B]]` type. Well, I say to you: "Using the `flatMap`, instead!". 
The `flatMap` will lift one level higher your type, returning you simple a `Try[B]` type.

{% highlight scala %}
// ...omissis...
  lines.flatMap(_ split " ")
       .map (s => Try(s(10)))
       // Using a flatMap the final type will be a RDD[Try[Char]] 
       // and not a RDD[Try[Try[Char]]]
       .flatMap(x => Try(s(20)))
{% endhighlight %}

Returning to our initial `RDD[Try[T]]`, now we have all the information we need to work with it. In my opinion, the best
way to work with this type is using the *for comprehension* structure. Let's have some dirty fun right now.

A *for-comprehension* in Scala is equal to syntactic sugar for a series of application of `flatMap` and `map` (and 
eventually some `filter` function). For example, take the following statements.
 
{% highlight scala %}
// list has type RDD[Try[Int]]
val rdd = sc.parallelize((0 to 10).toList).map(i => Try(i / 0))
val result = rdd.map(i => i.flatMap(j => Try(j * 6))
                           .flatMap(z => Try(z + 3))
                           .map(k => k + 42))  
{% endhighlight %} 

Using a *for-comprrehension* the above code can be simplified and rewritten as follow:

{% highlight scala %}
// list has type RDD[Try[Int]]
val result =
  rdd.map {
    i =>
      for {
        j <- i            
        z <- Try(j * 6)   // flatMap
        k <- Try(z + 3)   // flatMap
      } yield {
        k + 42            // map
      }
    }
{% endhighlight %} 
 
It is more readable, isn't it?

#### Collecting the results
At some point in your program you will need to get only the `Success` or `Failure` instances inside the `RDD[Try[T]]`. 
There is a lot of techniques to accomplish this task, but the one I preferred is to use the `collect` transformation. 

Differently from the homonym action, this method accepts a partial function as input and builds a new collection by 
applying the partial function to all elements on which the function is defined.

{% highlight scala %}
// successes has type RDD[Int], no more Try monad
val successes = 
  rdd.collect {
    // The method is applied only to elements of type Success.
    case Success(x) => x
  }
{% endhighlight %} 

And that's all, folks!
 
#### References
- [The Neophyte's Guide to Scala Part 6: Error Handling With Try](http://danielwestheide.com/blog/2012/12/26/the-neophytes-guide-to-scala-part-6-error-handling-with-try.html)
- [Getting an RDD of Failure[T] from an RDD[Try[T]] without compilation warning](https://stackoverflow.com/questions/39392162/getting-an-rdd-of-failuret-from-an-rddtryt-without-compilation-warning)
- [Spark 2.0 RDD API](http://spark.apache.org/docs/latest/api/scala/index.html#org.apache.spark.rdd.RDD)
- [Chapter 3: Programming with RDDs. Learning Spark, Holden Karau, Andy Konwinski, Patrick Wendell, Matei Zaharia, 
   2015, O'Reilly Media](http://shop.oreilly.com/product/0636920028512.do)