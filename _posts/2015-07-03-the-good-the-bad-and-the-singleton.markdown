---
layout: post
title:  "The Good, the Bad and the Singleton"
date:   2015-07-03 08:15:00
comments: true
categories: design programming
tags:
    - design pattern
    - programming
    - java
    - scala
summary: "If you search for the word Singleton on Google, you will probably come up with a bunch of rants about the
          fact that this design pattern is the absolute evil on the earth. Is it true? Or is this
          design pattern totally misunderstood by developers? In this series of articles I will try to analyze the
          reasons that stay behind those rants and I will try to give my point of view on the issue."
social-share: true
social-title: "The Good, the Bad and the Singleton"
social-tags: "design, java, scala, programming"
---
## Introduction
If you search for the word *Singleton* on Google, you will probably find a bunch of rants about the
fact that this design pattern is the absolute evil on the earth. Compared to the Singleton pattern, Darth 
Vader and Lord Voldemort are like little scout girls selling cookies door to door. Is it true? Or is the design pattern totally misunderstood by developers? In this series of articles I will try to analyze the
reasons that stay behind those rants and I will try to give my point of view on the issue.

So, let's start from the very beginning, the definition of the design pattern as it was given by the GoF's book.

## Singleton

The Singleton design pattern is an *object creational* design pattern. It was formalized by the GoF inside their
most famous book, [Design Patterns: Elements of Reusable Object-Oriented Software](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612).
The main *intent* of the pattern is the following:

> Ensure a class only has one instance, and provide a global point of access to it.

I know that some of you are beginning to stretch their nose. The word **global** sounds like a fart during a Mozart 
piano solo. But, let's we continue.

In the book the authors give us some examples in which a Singleton should be used: for examples,

> although there can be many printers in a system, there should be only one printer spooler. There should be only one
  file system and one window manager. 
  
Obviously, GoF gives us also a possible solution to the problem, which is:  

> A global variable makes an object accessible, but it doesn't keep you from instantiating multiple objects. A better 
  solution is to make the class itself responsible for keeping track of its sole instance.
  
OMG: have you noticed the violation of the *Single Responsibility Principle*? Were they foolish? No, they were not, but let's take one step at time.

Then, you will use a Singleton every time that:

* There must be exactly one instance of a class and it must be accessible to clients from a well-know access point.
* The sole instance should be extensible by sub-classing

The only structure that satisfies the previous constraints is the following:

![Singleton class diagram](http://rcardin.github.io/assets/2015-06-30/singleton_class_diagram.png)

Among the others, the virtues of a Singleton that are reported in GoF's book are the following:

1. *Reduced name space*: the Singleton avoids polluting the namespace with global variables that store sole instances
   (so C++ style...or Javascript anyone?).
2. *Permits refinement of operations and representation*: a Singleton may be subclassed and it's easy to configure the
   application with an instance of this extended class.
3. *More flexible than class operations*: has this sentence to be commented?
 
So far so good. You have to keep in mind that the book was published in 1994. Java, JVM and other related stuff are in an
embryonal state, and at that time nobody knew of dependency injection*, not even the DI's father, Martin Fowler. For sake of
completeness, let's look at Singleton implementation in Java and Scala.

### Singletons in Java: not such a good friend

Ok, the first implementation we can try is the one that translates directly from the previous UML class diagram into code.

{% highlight java %}
/* Naive Singleton implementation */
public class Singleton {
    // Single instance of Singleton
    private static Singleton INSTANCE = null;
    // Nobody can build a Singleton object from the outside
    private Singleton() { /* Initialisation code */ }
    
    // Public point of access to the Singleton
    public static Singleton getInstance() {
        // Lazy initialisation
        if (INSTANCE == null) {
            INSTANCE = new Singleton();
        }
        return INSTANCE;
    }
    // Other methods
}
{% endhighlight %}

Clearly, this naive implementation suffers of a well known problem: This implementation is not *thread safe*, due 
to the `if` condition on the variable `INSTANCE`. Then, be aware of this and don't use this type of Singleton! However, 
this implementation has a positive feature, which is it lazily initialises the variable `INSTANCE`.

Is it a good thing to have lazy initialisation in your production code? Well, the lazy initialisation violates the *fail fast principle*. It's better to know as sooner as possible if there is a problem in initialisation
code of a class. 

Then, if you want to adhere to the *fail fast principle*, you can change the previous Singleton implementation to the
following.

{% highlight java %}
/* Singleton implementation without lazy initialisation */
public class Singleton {
    // Eager initialisation 
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() { /* Initialisation code */ }
    
    public static Singleton getInstance() {
        return INSTANCE;
    }
}
{% endhighlight %}

If you still want to have the lazy initialisation, you can use the [Initialization On Demand Holder](http://www.cs.umd.edu/~pugh/java/memoryModel/jsr-133-faq.html#dcl)
idiom.

{% highlight java %}
/* Singleton implementation with lazy initialisation */
public class Singleton {
    
    private Singleton() { /* Initialisation code */ }
    // This class is lazily loaded by the class loader
    private static class LazySingletonHolder {
      public static Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() {
        return LazySingletonHolder.INSTANCE;
    }
}
{% endhighlight %}

With these approaches, we gain the *thread safety* feature (if you want to know why the IODH approach is thread safe, 
please read this [SO thread](http://stackoverflow.com/questions/20995036/is-initialization-on-demand-holder-idiom-thread-safe-without-a-final-modifier)). 
However, these types of Singleton *cannot be sub-classed* and they are not *serializable*. 

If you want to get back the *serializability*, you can use the approach suggested by Joshua Block in **item 3** of the
second edition of the book [Effetctive Java](http://www.amazon.com/Effective-Java-Edition-Joshua-Bloch/dp/0321356683).

> As of release 1.5, there is a third approach to implementing singletons. Simply make an enum type with one element:

{% highlight java %}
// Enum singleton - the preferred approach
public enum Singleton {
    INSTANCE;
    public void leaveTheBuilding() { /* ... */ }
}
{% endhighlight %}

> This approach is functionally equivalent to the public field approach, except that it
  is more concise, provides the serialization machinery for free, and provides an
  ironclad guarantee against multiple instantiation, even in the face of sophisticated
  serialization or reflection attacks.

Is this enough? What about sub-classing? If you remember, the ability to be sub-classed is one of the main 
features of Singleton reported in the GoF's book. Sub-classing a Singleton is a very difficult topic, because you have
to guarantee that the `INSTANCE` variable of the base class will be instantiated only once using an instance of one of its
sub-class. This topic is far beyond the focus on this article. An example of Singleton sub-classing can
be found in the *Implementation* section of the chapter related to Singleton in the GoF's book.

### Idiomatic Singleton in Scala
What about the Scala language? Scala became a mainstream programming language a decade after Java. So, it had the
time to learn from the errors of others language. Some of you could say: "*So, why the f\*\*\*k is there a way to have an 
idiomatic implementation of an anti-pattern like the Singleton pattern?*". We will try to answer to this question in the next
article.

In Scala the Singleton pattern is integrated into the language specification. The `object` notation enforces that a type
will have one and only one instance.

{% highlight scala %}
// There can only be one instance of ChuckNorris (obviously)
object ChuckNorris {
  val name = "Chuck Norris"
  // This is a method of the Singleton
  def roundhouseKick = "Roundhouse kick"  
}
println ChuckNorris.roundhouseKick
{% endhighlight %}

As you know, if we have an `object` type that has the same name as a `class` type, we will call it *companion object* of
the class. But, that is another story ;)

## Conclusions
In this article we have analyzed the Singleton pattern from an agnostic point of view. First, we have introduced it through
the definition given in the GoF's book. Then, we have discussed how to implement the pattern using the Java language and
the Scala language. 

We intentionally have not given any judgment from a design point of view. In the upcoming article, we will try to understand
why the Singleton pattern is so hated by so many software architects and programmers. We will introduce the difference
between "Singleton" and "singleton" and we will probably reach the conclusion that the best answer to the question "*How will you implement a Singleton in a specific programming language?*" is: "*I will not implement it at all!*". 

## References

- [Chapter: Singleton (pag. 127). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Lazy Loading Singletons](http://blog.crazybob.org/2007/01/lazy-loading-singletons.html)
- [Item 3: Enforce the singleton property with a private constructor or an enum type](http://www.informit.com/articles/article.aspx?p=1216151&seqNum=3)
