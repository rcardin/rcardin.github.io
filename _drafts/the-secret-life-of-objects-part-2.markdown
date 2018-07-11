---
layout: post
title:  "The Secret Life of Objects: Inheritance"
date:   2018-07-10 09:01:12
comments: true
categories: design programming oop fp
tags:
    - design
    - programming
    - oop
summary: "This is the second part of a series of posts concerning the basic concepts of Object-Oriented Programming. This time, I will focus on the concept of Inheritance. Whereas most of people think that it is easy to understand, the inheritance is a knowledge that is very difficult to properly master. It subtends a lot of other object-oriented programming principles that are not always directly related to it. Moreover, it is directly related to one of the strongest form of dependency between object. So, let's get this party started."
social-share: true
social-title: "The Secret Life of Objects: Inheritance"
social-tags: "OOP, design, Programming"
math: false
---

This is the second part of a series of posts concerning the basic concepts of Object-Oriented Programming. The fist post has focus on [Information Hiding](http://rcardin.github.io/design/programming/oop/fp/2018/06/13/the-secret-life-of-objects.html). This time, I will focus on the concept of _Inheritance_. Whereas most of people think that it is easy to understand, the inheritance is a knowledge that is very difficult to properly master. It subtends a lot of other object-oriented programming principles that are not always directly related to it. Moreover, it is 
directly related to one of the strongest form of dependency between object. 

Out of there, many articles and posts rant against Object-Oriented Programming and its principles, just because they don't understand them. One of these post is [Goodbye, Object Oriented Programming](https://medium.com/@cscalfani/goodbye-object-oriented-programming-a59cda4c0e53), which treats inheritance and the others principles witha a very biased and naive eye.

So, let's get this party started, and let's demistify the inheritance in object-oriented programming once for all.

## The definition
A good point where to start to analyze a concept is its definition.

> Inheritance is a language feature that allows new objects to be defined from existing ones.

Given that we have a class for each object

> an object's class defines how the object is implemented, i.e. the internal state and the implementation of its operations. [..] In contrast, an object's type only refers to its interface, i.e. the set of requests to which it can respond.

So,

> It is important to understand the difference between class inheritance and interface inheritance (or subtyping). Class inheritance defines an object's implementation in terms of another object's implementation. In short, it's a mechanim for code sharing. In contrast, interface (or subtyping) describes when an object can be used in place of another.

## The big misunderstanding

By now, we understood there are two types of inheritance: Class inheritance and interface inheritance (or subtyping). When you used the former, you're basically perfoming *code reuse*, that is you know a class as a piece of code you need, and you extending from it to reuse that code, redefining all the stuff you don't need.

{% highlight scala %}
class AlgorithmThatReadFromCsvAndWriteOnMongo(val filePath: String, val mongoUri: String) {
  def read(): List[String] = {
      // Code that reads from a CSV file
  }
  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb
  }
}
class AlgorithmThatReadFromKafkaAndWriteOnMongo(
  val broker: String, val topic: String, val mongoUri: String)
  extends AlgorithmThatReadFromCsvAndWriteOnMongo(null, mongoUri) {

  def read(): List[String] = {
      // Code that reads from a Kafka topic
  }
}
class AlgorithmThatReadFromKafkaAndWriteOnMongoAndLogs(
  val broker: String, val topic: String, val mongoUri: String, val logFile: String)
  extends AlgorithmThatReadFromKafkaAndWriteOnMongo(broker, topic, mongoUri) {

  def write(lines: List[String]): Unit = {
      // Code that writes to MongoDb and to log file
  }
}
{% endhighlight %}

Clearly, the class `AlgorithmThatReadFromKafkaAndWriteOnMongo` inherits from `AlgorithmThatReadFromCsvAndWriteOnMongo` only to reuse the code that writes on MongoDb. The drawback is that we have to pass `null` to the constructor of the parent class. Something is not good here.

### The banana, monkey, jungle problem

> The problem with object-oriented languages is they’ve got all this implicit environment that they carry around with them. You wanted a banana but what you got was a gorilla holding the banana and the entire jungle.

This quote is by _Joe Armstrong_, the creator of Erlang. For this principle, every time you try to reuse some class, you need to add dependencies also to the its parent class, and to the parent class of the parent class, and so on.

Well. This is the problem of class inheritance. This is the problem of _code reuse_.

As discussed in the post [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html), class inheritance is the worst form of dependency between two classes. We already related the concept of dependency between classes and the probability of modifying one against one change in another.

It is normal that if two classes are linked through this type of relation, they must be used togheter. This is the problem of inheritance: _Tight coupling_.

So, first of all do not use class inheritance. Do not use inheritance to reuse some code. Use inheritance so share **behavior**.

## Subtyping

But, wait: Is this a break to encapsulation. Well, many of us would say yes. As, subclass (classes that inherits from another) knows and and can virtaully access to internal state of the base class, we are breaking encapsulation. So, we are violating the first principle of object-oriented programming. Is this possible? 

## References

- [Four Basic Concpets in Object-Oriented Languages, Chapter 10: Concepts in Object-Oriented Languages. Concepts in Programming Languages, John C. Mitchell, 2003, Cambridge University Press]