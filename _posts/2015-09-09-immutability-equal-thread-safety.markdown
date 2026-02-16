---
layout: post
title:  "Immutability = Thread-safety"
date:   2015-09-09 22:04:00
comments: true
categories: programming thread-safety immutability java scala
tags:
    - thread-safety
    - immutability
    - java
    - scala
summary: "No, there is not a typo in the title of this post. It is a distorted quotation from the Slipknot song 
          'People equal s**t'. And more or less this was my reaction when I discovered that in Java immutability is 
          not equals to thread-safety. Not always. Let me explain why."
social-share: true
social-title: "Immutability = Thread-safety"
social-tags: "programming, java, scala"
---
No, there is not a typo in the title of this post. It is a distorted quotation from the Slipknot song "People equal s**t"

<iframe width="420" height="315" src="https://www.youtube.com/embed/u6ZtHrWiSAk" frameborder="0" allowfullscreen></iframe>

And more or less this was my reaction when I discovered that in Java *immutability is not equals to thread-safety*. 
Not always. Let me explain why.

## We need some definition first
All it comes from the fact that I am reading the book [Java concurrency in practice](http://www.amazon.com/Java-Concurrency-Practice-Brian-Goetz/dp/0321349601),
a.k.a. JCIP, written by Brian Goetz. The book is very well written and it is a milestone in the Java Community. In the book,
Goetz and al. tries to give us a reasoned vision of the problems belonging to the concurrency world. The language used 
in the examples is obviously Java, but this is a collateral fact.

So, we are trying to answer to the question "Does immutability imply thread-safety?". First, we need to give the 
definition of *thread-safety* and *immutability*. As Goetz wrote in JCIP, it is very difficult to give a definition to
the concept of **thread-safety**. Basically,

> Writing thread-safe code is, at its core, about managing access to state, and in particular to shared, mutable state.
  [..] An object's state is its data, stored in state variables such as instance or static fields. [..] By shared, we 
  mean that a variable could be accessed by multiple threads; by mutable, we mean that its value could change during its 
  lifetime. [..] Whether an object needs to be thread-safe depends on whether it will be accessed from multiple threads. 
  This is a property of how the object is used in a program, not what it does.
  
Dafuq! So, speaking about *thread-safety* does not mean to speak about the execution of the program. The main focus is
on the **state** of the classes that compose a program, and on how this state may be accessed by other threads.

Talking about an object state, let's introduce the definition of **immutability**. We can take the definition from 
*item 15, Minimize mutability* of the book [Effective Java](http://www.amazon.com/Effective-Java-Edition-Joshua-Bloch/dp/0321356683) by Joshua Bloch:

> An immutable class is simply a class whose instances cannot be modified. All of the information contained in each 
  instance is provided when it is created and is fixed for the lifetime of the object.

These two definitions let you glimpse the relationship between immutability and thread-safety. If thread-safety is related to 
the possible changes of objects' internal state, avoiding those changes makes easy to talk about thread-safety.
    
Ok, this is the theory and we like it. But, we want to make our hands dirty. So, let's talk about code.
 
## Immutability in Java
It is surprising that there is no an idiomatic way in the Java language to make a class immutable. I suppose that the
problem here is that Java winks to C++ and other procedural programming languages, more than to Lisp and Haskell.
By the way, we can try to implement an immutable class strictly following the above definition.

{% highlight java %}
public class Person {
    // Name of the person
    private String name;
    // Timestamp of the birth date
    private long birth;
    
    public Person(String name, long birth) {
        this.name = name;
        this.birth = birth; 
    }
    // Public accessor methods, no modifiers
    public String getName() { 
        return name; 
    }
    public long getBirth() {
    }
}
{% endhighlight %}

As requested by definition, the state of class `Person` is not modifiable after the creation of an object. Every 
attribute of the class is also immutable, so there is no possibility that a mutable state can "escapes" from the class 
using the accessor methods. Nice. The only problem is the *Java Memory Model* of the JVM that executes your code, but who 
cares? :)

## The Java Memory Model

Seriously, there is a problem with the above code. First of all: what is the **Java Memory Model**, a.k.a. JMM or 
JSR133? Looking at the FAQ page of the JSR133 we can find that

> The Java Memory Model describes what behaviors are legal in multithreaded code, and how threads may interact through 
  memory. It describes the relationship between variables in a program and the low-level details of storing and 
  retrieving them to and from memory or registers in a real computer system. It does this in a way that can be 
  implemented correctly using a wide variety of hardware and a wide variety of compiler optimizations.
  
The JMM that we are using was released together with the version 5 of Java. Prior to this, the former JMM was so full of bugs that even the 
"[Double check locking](http://www.cs.umd.edu/~pugh/java/memoryModel/DoubleCheckedLocking.html)" technique did not work 
properly.

Probably you're asking yourself why the hell you have to be worried about the JMM. The problem is that *the statements 
defined in a constructor method could be reordered by the compiler*, as well as the ones of any other method. Take for
example the following code taken from JCIP.

{% highlight java %}
public class UnsafeLazyInitialization {
    private static Resource resource;
 
    public static Resource getInstance() {
        if (resource == null) //1
            resource = new Resource();  //2
        return resource; //3
    }
}
{% endhighlight %}

We know for sure that this class is not thread-safe because the attribute `resource` could be instantiated more then
once (see [The Good, the Bad and the Singleton](http://rcardin.github.io/design/programming/2015/07/03/the-good-the-bad-and-the-singleton.html) 
for details). But, what is surprising is that

 1. `getInstance` could return an object in an inconsistent state
 2. `getInstance` could return `null`
 
Why should this happen? Because of compiler reordering. Without any synchronization mechanism, the above statement 2 is 
not atomic for the JVM and so it could be completely rewritten by the compiler. For this reason, the execution
could lead to this order of statements:

 1. allocate some memory
 2. create the new object
 3. initialise its fields with their default value (false for `boolean`, `0` for other primitives, `null` for objects)
 4. assign the reference to the newly constructed object to resource
 5. run the constructor, which includes running parent constructors too
 
As you have guessed, steps 4 and 5 are executed in a more then insane order, and this leads clearly to 
thread-safety problems. What is more surprising is that the `getInstance` could return `null`. However, the proof of this 
statement is very hard, so I recommend you to read it from a post of the user *assylias*, 
[Java Memory Model and reordering](https://assylias.wordpress.com/2013/02/01/java-memory-model-and-reordering/).

So, are we fucked up!? No, we're not and the solution is easier than what you're thinking about.

## Use the `final`, Luke!
 
Fortunately, Goetz and al. put a strong requirement in the definition of the JSR133, which is

> Assuming the object is constructed "correctly", once an object is constructed, the values assigned to the `final` fields 
  in the constructor will be visible to all other threads without synchronization. In addition, the visible values for 
  any other object or array referenced by those `final` fields will be at least as up-to-date as the final fields.
  
Informally, the above sentences mean that we have to declare the attributes of a class as `final`, if we want to prevent that
their construction will be reordered by the compiler. And this fact closes the cycle. Recalling the definition of 
immutability which we gave above, we can now assert that the right way to implement the immutable `Person` class is:

{% highlight java %}
public class Person {
    // Name of the person
    private final String name;
    // Timestamp of the birth date
    private final long birth;
    
    public Person(String name, long birth) {
        this.name = name;
        this.birth = birth; 
    }
    // Public accessor methods, no modifiers
    public String getName() { 
        return name; 
    }
    public long getBirth() {
    }
}
{% endhighlight %}

As you can imagine, it is important to use `final` attributes as much as we can. In this way, we can save a lot of time
from debugging multi-threaded code, that is not working properly.
 
Finally, under these conditions we can now proudly say that: *"Yes, Immutability implies thread-safety"*. 

## Immutability in Scala
Scala and many other modern programming languages are build on top of the JVM. For this reason, they do not define a
custom model for multi-threaded programs execution, but they reuse the one defined in Java. A question easily rises: do
Scala suffer of the same problems we have seen so far? I've made this question on [Stackoverflow](https://stackoverflow.com/questions/32113124/immutability-and-thread-safety-in-scala/32241751#32241751). 
Nobody answer my question, so I found the answer from myself :(
  
One of the cool things about Scala is that it was born years after Java. So, Martin Odersky and his colleagues had the
opportunity to learn from early Java's design errors. They understood that immutability is so important as a concept, 
that they introduced an idiomatic way to declare a class as immutable, using a `case class`. For example, our  
immutable class `Person` in Scala will become the following.

{% highlight scala %}
case class Person(val name: String, val birth: Long)
{% endhighlight %}

The question now is: when the Scala compiler generates the `.class` bytecode file, does it implement the two immutable
attributes using the `final` keyword? It seems that the only way to know if this fact is true, is to use the java
disassembler `javap` and look at the information which it extracts.

So, I've compiled the following class with the `scalac` compiler, version 2.10.2.

{% highlight scala %}
case class A(val a: Any)
{% endhighlight %}

And then I've run the command `javap -p A.class` on the `.class` file that was generated by the compiler. The output
of the execution was the following disassembled code

{% highlight java %}
Compiled from "A.scala"
public class A implements scala.Product,scala.Serializable {
  // Final attribute !!!
  private final java.lang.Object a;
  public static <A extends java/lang/Object> scala.Function1<java.lang.Object, A
> andThen(scala.Function1<A, A>);
  public static <A extends java/lang/Object> scala.Function1<A, A> compose(scala
.Function1<A, java.lang.Object>);
  public java.lang.Object a();
  public A copy(java.lang.Object);
  public java.lang.Object copy$default$1();
  public java.lang.String productPrefix();
  public int productArity();
  public java.lang.Object productElement(int);
  public scala.collection.Iterator<java.lang.Object> productIterator();
  public boolean canEqual(java.lang.Object);
  public int hashCode();
  public java.lang.String toString();
  public boolean equals(java.lang.Object);
  public A(java.lang.Object);
}
{% endhighlight %}

As you can see from the above code snippet, the sole attribute `a` was translated by `scalac` in `private final` 
attribute. 

We can conclude that in Scala the concept of immutability is idiomatically implemented in a way that is
consistent with respect to the JMM. In Scala it is true to say that *immutability implies thread-safety*.
 
## References
- [Chapter II: Thread Safety. Java concurrency in practice, Brian Goetz, 2006, Addison-Wesley Professional](http://www.amazon.com/Java-Concurrency-Practice-Brian-Goetz/dp/0321349601)
- [Item 15: Minimize mutability. Effective Java, Joshua Bloch, 2008, Addison-Wesley](http://www.amazon.com/Effective-Java-Edition-Joshua-Bloch/dp/0321356683)
- [What is a memory model, anyway?](https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html#whatismm)
- [How do final fields work under the new JMM?](https://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html#finalRight)
- [Double check locking](http://www.cs.umd.edu/~pugh/java/memoryModel/DoubleCheckedLocking.html)
- [Java Memory Model and reordering](https://assylias.wordpress.com/2013/02/01/java-memory-model-and-reordering/)