---
layout: post
title:  "Template Method Pattern Revised"
date:   2018-02-05 13:59:34
comments: true
categories: design programming
tags:
    - design
    - programming
summary: "When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to big haedhache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became main stream, this pattern can be revised using lambda expressions, avoiding any inheritance panic."
social-share: true
social-title: "Template Method Pattern Revised"
social-tags: "desing, Programming"
math: false
---

When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to big haedhache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became main stream, this pattern can be revised using lambda expressions, avoiding any inheritance panic.

## The original pattern
It's the year 2004. Martin Fowler had just published one of its most popular post [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) (IoC). The pattern is a concretization of the famous _Hollywood Principle_, that states

> Don't call us, we'll call you

Every Java framework in those years implements that principle: Struts, Spring MVC, Hibernate, and so on. However, the IoC was not a freshly new idea. It took its roots from a weel know design pattern of the _Gang of Four_, the *Template Method Pattern*.

The intent of the pattern is the following.

> Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.

Uhm, it seems promise. I think it is better to make a concrete example. The example is taken directly from the GoF's book.

Consider an application framework that provides an `Application` and `Document` classes. The `Application` class is responsible for _opening_ existing documents stored in an external format, such as a file. Whereas, a `Document` object represents the information in a document once it's read from the file.

So, the objective is to create a structure with these classes that enables to add easily new kinds of documents. Following the Template Method Pattern, we have to abstract the common parts of the _open_ between the various documents' types in a common place and let the details relative to each type in dedicated structures.

In our example, the _open_ algorithm is virtually made of the following tasks.

1. Check if the document can be opened
2. Create an in memory representation of the document
2. Eventually make preliminar operations
4. Read the document

Translating this into code, we obtain the folliwing class.

{% highlight scala %}
trait Application {
  def openDocument(fileName: String): Try[Document]
  def canOpen(fileName: String): Boolean
  def create(fileName: String): Document
  def aboutToOpen(doc: Document) = { /* Some default implementation */ 34}
  def read(doc: Document)
}

abstract class GenericApplication() extends Application {
  def openDocument(fileName: String): Try[Document] = {
    Try {
      if (canOpen(fileName)) {
        val document = create(fileName)
        aboutToOpen(document)
        read(document)
        document
      }
    }
  }  
}
{% endhighlight %}

As you can see, the method `openDocument` defines a _template_ of the algorithm needed to open a document. For this reason it is called a _template method_. Whereas, all other methods are abstract or provides defaults implemenation for a task. The former are called _primitive operations_; The latter are called _hook operation_, instead.

Implementing an application that can open CSV file means to extend the `GenericApplication` class, implementing properly the methods that were left abstract.

{% highlight scala %}
class CsvApplication() extends GenericApplication {
  def canOpen(fileName: String): Boolean = { /* Some implementation */ }
  def create(fileName: String): Document = { /* Some implementation */ }
  def read(doc: Document) = { /* Some implementation */ }
}
{% endhighlight %}

### Drawbacks
One of the main consequence of the original Template Method pattern is _code reuse_. In this blog, we don't like code reuse. In [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html) post, we learnt that we should avoid code reuse in favor of _behaviour reuse_. Code reuse leads to an increase of dependency between classes, resulting in architectures, which components are tightly coupled.

Bad. Really Bad.

Moreover, the abuse of the Template Method pattern tends to generate deep hierarchies of _concrete_ classes. Let's return to our example. One day, your boss ask you to extend the above code to handle more than one type of storage. He wants the software to be able to read both from local filesystem and from the cloud, or from distributed filesystems like HDFS.

Easy, you think. We already have a primitive method, `read`, that I can override to allow my program to read from any kind of storage. You are a smart boy.

{% highlight scala %}
class CsvApplication() extends GenericApplication { /* ... */ }
class CsvOnHDFSApplication() extends GenericApplication { 
  /* ... */ 
  override def read(doc: Document) = { /* Some implementation */ }
}
class CsvOnCloudApplication() extends GenericApplication { 
  /* ... */ 
  override def read(doc: Document) = { /* Some implementation */ }
}
// And so on...
{% endhighlight %}

At some point, you need to change the `canOpen` in the  `CsvApplication`. Unfortunately, the new implementation does not fit the behaviour in the `CsvOnCloudApplication` class. Then, you need to override also the `canOpen` method in this class. One day, you will have to change the implementation of another primitive method in some other class in your hierarchy. And the story will repeat over and over again.

Do you see the problem? You miss the maintainability of your classes. You do not know which behaviour is implemented in which class. Every time you modify a class, it is difficult to predict which other classes you need to change.

What can we do at this point? Which alternatives do we have?

> Favor composition over inheritance



## References
- [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
- [Inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)
- [Chapter: Template Method Pattern (page 325). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)