---
layout: post
title:  "The Secret Life of Objects: Inheritance"
date:   2018-07-27 13:50:12
comments: true
categories: design programming oop fp
tags:
    - design
    - programming
    - oop
summary: "This post is the second part of a series of posts concerning the basic concepts of Object-Oriented Programming. This time, I focus on the concept of Inheritance. Whereas most people think that it is easy to understand, the inheritance is a piece of knowledge that is very difficult to master correctly. It subtends a lot of other object-oriented programming principles that are not always directly related to it. Moreover, it is directly related to one of the most potent forms of dependency between objects. So, let's get this party started."
social-share: true
social-title: "The Secret Life of Objects: Inheritance"
social-tags: "OOP, design, Programming"
reddit-link: "https://www.reddit.com/r/programming/comments/92dghb/the_secret_life_of_objects_inheritance/"
math: false
---

This post is the second part of a series of posts concerning the basic concepts of Object-Oriented Programming. The first post has focused on [Information Hiding](http://rcardin.github.io/design/programming/oop/fp/2018/06/13/the-secret-life-of-objects.html). This time, I focus on the concept of _Inheritance_. Whereas most people think that it is easy to understand, the inheritance is a piece of knowledge that is very difficult to master correctly. It subtends a lot of other object-oriented programming principles that are not always directly related to it. Moreover, it is 
directly related to one of the most potent forms of dependency between objects. 

Out of there, many articles and posts rant against Object-Oriented Programming and its principles, just because they don't understand them. One of these posts is [Goodbye, Object Oriented Programming](https://medium.com/@cscalfani/goodbye-object-oriented-programming-a59cda4c0e53), which treats inheritance and the others object-oriented principles with a very biased and naive eye.

So, let's get this party started, and let's demystify the inheritance in object-oriented programming once for all.

## The definition
A good point where to start to analyze a concept is its definition.

> Inheritance is a language feature that allows new objects to be defined from existing ones.

Given that we have a class for each object

> an object's class defines how the object is implemented, i.e. the internal state and the implementation of its operations. [..] In contrast, an object's type only refers to its interface, i.e. the set of requests to which it can respond.

So,

> It is important to understand the difference between class inheritance and interface inheritance (or subtyping). Class inheritance defines an object's implementation in terms of another object's implementation. In short, it's a mechanism for code sharing. In contrast, interface (or subtyping) describes when an object can be used in place of another.

## The big misunderstanding

By now, we understood there are two types of inheritance: Class inheritance and interface inheritance (or subtyping). When you used the former, you're performing *code reuse*, that is you know a class as a piece of code you need, and you are extending from it to reuse that code, redefining all the stuff you don't need.

{% highlight scala %}
class AlgorithmThatReadFromCsvAndWriteOnMongo(filePath: String, mongoUri: String) {
  def read(): List[String] = {
      // Code that reads from a CSV file
  }
  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb
  }
}
class AlgorithmThatReadFromKafkaAndWriteOnMongo(broker: String, topic: String, mongoUri: String)
  extends AlgorithmThatReadFromCsvAndWriteOnMongo(null, mongoUri) {

  def read(): List[String] = {
      // Code that reads from a Kafka topic
  }
}
class AlgorithmThatReadFromKafkaAndWriteOnMongoAndLogs(broker: String, topic: String, mongoUri: String, logFile: String)
  extends AlgorithmThatReadFromKafkaAndWriteOnMongo(broker, topic, mongoUri) {

  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb and to log file
  }
}
{% endhighlight %}

Clearly, the class `AlgorithmThatReadFromKafkaAndWriteOnMongo` inherits from `AlgorithmThatReadFromCsvAndWriteOnMongo` only to reuse the code that writes on MongoDB. The drawback is that we have to pass `null` to the constructor of the parent class. Something is not good here.

### The banana, monkey, jungle problem

> The problem with object-oriented languages is they’ve got all this implicit environment that they carry around with them. You wanted a banana but what you got was a gorilla holding the banana and the entire jungle.

This quote is by _Joe Armstrong_, the creator of Erlang. For this principle, every time you try to reuse some class, you need to add dependencies also to its parent class, and to the parent class of the parent class, and so on.

Using the previous example, if you want to reuse the class `AlgorithmThatReadFromKafkaAndWriteOnMongoAndLogs`, you also need to import classes `AlgorithmThatReadFromCsvAndWriteOnMongo` and `AlgorithmThatReadFromKafkaAndWriteOnMongo`

Well. The above is the problem of class inheritance. The above is the problem of _code reuse_.

As discussed in the post [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html), class inheritance is the worst form of dependency between two classes. We already related the concept of dependency between classes and the probability of modifying one against one change in another.

It is normal that if two classes are linked through this type of relation, they must be used together. This fact is the problem of inheritance: _Tight coupling_.

First of all, do not use class inheritance. Do not use inheritance to reuse some code. Use inheritance so share **behavior** among components.

Afterward, do not put more than one _responsibility_ inside a class. I don' t dwell on what responsibility is. I already wrote about this topic in [Single-Responsibility Principle done right](http://rcardin.github.io/solid/srp/programming/2017/12/31/srp-done-right.html). However, if you let your components to implement more than one use case; If you let two different clients of a component to depend from different slices of it, then the problem is not inheritance, it is in your whole design. A component that implements only one responsibility is very likely to inherit from a hierarchy that contains only one type, which is most of the times an _abstract type_.

Concerning our previous example,  there is a problem of code reuse and a violation of the Single-Responsibility Principle. Each class is doing too much, and it is doing in the wrong way.

### Inheritance and encapsulation

If you think about it, there is a big problem with class inheritance: It seems to break encapsulation. A subclass (a class that inherits from another) knows and can virtually access to the internal state of the base class. We are breaking encapsulation. So, we are violating the first principle of object-oriented programming, are not we?

Well, not properly. If a class you inherit from exposes some `protected` state, it is like that class is exposing two kinds of interfaces.

> The _public_ interface lists what the general client may see, whereas the _protected_ interface lists what inheritors may see.

The problem is that maintaining two different interfaces of the same type is very hard. Adding more types of clients to a class means to add dependencies. The more dependencies, the higher the coupling. A high coupling means a higher probability of changes cascades among types.

So, don't use class inheritance. Stop.

If you can't use inheritance, why is this considered one of the essential principles of object-oriented programming? Technically, inheritance is still possible under certain circumstances.

## Subtyping or reusing behavior
The first case in which you are allowed to use inheritance is **subtyping**, or behavior inheritance, or interface inheritance.

> Class inheritance defines an object's implementation in terms of another object's implementation. In short, it's a mechanism for code and representation sharing. In contrast, interface inheritance (or subtyping) describes when an object can be used in place of another.

The above sentence is very informative. It screams to the world that you **must not** override methods of superclasses if you want to reuse behavior.

Following this principle, the only types from which we can inherit are _interfaces_ and _abstract classes_, avoiding to override any concrete method of the latter.

> When inheritance is used carefully (some will say properly), all classes derived from an abstract class will share its interface. [..] Subclasses merely adds or overrides operations and **does not hide the operations of the parent class**.

Why is this principle so important? Because of _polymorphism_ depends on it. In this way, clients remain unaware of the specific type of objects they use, **reducing implementation dependencies drastically**.

> Program to an interface, not an implementation.

### Favor object composition over class inheritance

The only way we have to extend the behavior of a class is to use _object composition_. Obtain new functionalities by assembling objects to get more complex functionalities. Objects are composed using their well-defined interfaces solely.

This style of reuse is called **black-box reuse**. No internal details of objects are visible from the outside, producing the lowest possible dependency degree.

> Object composition has another effect on system design. Favoring object composition over class inheritance helps you keep each class encapsulated and focused on one task, on a single responsibility.

Our initial example can be rewritten using two new highly specialized types: a `Reader`, and a `Writer`.

{% highlight scala %}
trait Reader {
  def read(): List[String]
}
trait Writer {
  def write(lines: List[String]): Unit
}
class CsvReader(filePath: String) {
  def read(): List[String] = {
      // Code that reads from a CSV file
  }  
}
class MongoWriter(mongoUri: String) extends Writer {
  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb
  }  
}
class KafkaReader(broker: String, topic: String) extends Reader {
  def read(): List[String] = {
      // Code that reads from a Kafka topic
  }  
}
class LogWriter(logFile: String) extends Writer {
  def write(lines: List[String]): Unit = {
      // Code that writes to a log file
  }  
}
class AlgorithmThatReadFromCsvAndWriteOnMongo(val filePath: String, val mongoUri: String) {
  def read(): List[String] = {
      // Code that reads from a CSV file
  }
  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb
  }
}
// Composing the above classes into this class, we can read and write from and 
// to whatever we want.
class Migrator(reader: Reader, writers: List[Writer]) {
  val lines = reader.read()
  writers.foreach(_.write(lines))
}
{% endhighlight %}

## The Liskov Substitution Principle

It seems that inheritance should not be used in any case. You must not inherit from a concrete class, only from abstract types. Is it correct? Well, there is a specific case, in which the inheritance from concrete classes is allowed.

The Liskov Substitution Principle (LSP) tells us exactly which is this case.

> Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it.

A class can inherit from another concrete class if and only if it does not override the pre e postcondition of the base class. In a derivated class, preconditions must not be stronger than in the base class. In a derivate class, postconditions must be stronger than in the base class.

> When redefining a routine [in a derivative], you may only replace its precondition by a weaker one, and its postcondition by a stronger one.

The above is called _design by contract_. Respecting this principle avoids the redefinition of the _extrinsic public behavior_ of a base class, that is the behavior the clients of a class depend upon.

![Ducks and the Liskov Substitution Principle](https://image.ibb.co/cyshi7/lsp.jpg)

Returning to our previous example, take the class `AlgorithmThatReadFromCsvAndWriteOnMongo` and its subclass `AlgorithmThatReadFromKafkaAndWriteOnMongo`. The LSP tells us that whenever we need a reference to the first, we can use a reference to the second instead. However, in our example, we can't. The first read from a CSV; the second from Kafka.

It's easy to write a test that uses an object of type `AlgorithmThatReadFromKafkaAndWriteOnMongo` where an
object of type `AlgorithmThatReadFromCsvAndWriteOnMongo` is requested. It's easy to see it fail.

Why? The reason is that we have violated base class *invariants*. We tried to reuse code, and not to reuse behavior.

The same, old story.

## Conclusion

To sum up: try to avoid the reuse of code. Avoid class inheritance, if possible. Try to reuse behavior. Try to use subtyping. Prefer not to extend a concrete class. Alternatively, if you have to, verify that you fulfill the Liskov Substitution Principle.

If you follow these simple rules, the dependency degree between your classes will stay low, and your architecture will be simpler to maintain and evolve.

Simple. As. F**k.

## References

- [Four Basic Concpets in Object-Oriented Languages, Chapter 10: Concepts in Object-Oriented Languages. Concepts in Programming Languages, John C. Mitchell, 2003, Cambridge University Press](https://www.amazon.it/Concepts-Programming-Languages-John-Mitchell/dp/0521780985/)
- [How Design Patterns Solve Design Problems, Chapter 1: Introduction. Design Patterns, Elements of Reusable Software, E. Gamma, R. Helm, R. Johnson, J. Vlissides, 1995, Addison-Wesley](https://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [The Liskov Substitution Principle (LSP). Agile Principles, Patterns, and Practices in C#, Robert C. Martin, Micah Martin, 2006, Prentice Hall](https://www.safaribooksonline.com/library/view/agile-principles-patterns/0131857258/)
- [What is an example of the Liskov Substitution Principle?](https://stackoverflow.com/questions/56860/what-is-an-example-of-the-liskov-substitution-principle)
