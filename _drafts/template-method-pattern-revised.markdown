---
layout: post
title:  "Template Method Pattern Revised"
date:   2018-02-05 13:59:34
comments: true
categories: design programming
tags:
    - design
    - programming
summary: "When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to a big headache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became mainstream, this pattern can be revised using lambda expressions, avoiding any inheritance panic."
social-share: true
social-title: "Template Method Pattern Revised"
social-tags: "desing, Programming"
math: false
---

When I started programming, there was a design pattern among all the others that surprised me for its effectiveness. This pattern was the Template Method pattern. While I proceeded through my developer career, I began to understand that the inconsiderate use of this pattern could lead to a big haedache. The problem was that this pattern promotes code reuse through class inheritance. With functional programming became mainstream, this pattern can be revised using lambda expressions, avoiding any inheritance panic.

## The original pattern
It's the year 2004. Martin Fowler had just published one of its most popular post [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) (IoC). The pattern is a concretization of the famous _Hollywood Principle_, which states

> Don't call us, we'll call you

Every Java framework in those years implements that principle: Struts, Spring MVC, Hibernate, and so on. However, the IoC was not a fresh new idea. It took its roots from a well-known design pattern of the _Gang of Four_, the *Template Method Pattern*.

The intent of the pattern is the following.

> Define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.

Uhm, it looks promising. I think it is better to make a concrete example. The example is taken directly from the GoF's book.

Consider an application framework that provides an `Application` and `Document` classes. The `Application` class is responsible for _opening_ existing documents stored in an external format, such as a file. Whereas, a `Document` object represents the information in a document once it's read from the file.

So, the objective is to create a structure with these classes that enable to add easily new kinds of documents.

In our example, the _open_ algorithm is virtually made of the following tasks.

1. Check if the document can be opened
2. Create an in-memory representation of the document
2. Eventually, make preliminary operations
4. Read the document

Translating this into some dirty code, we obtain the following class.

{% highlight scala %}
trait Application {
  // Template method
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
  // Hook method
  def aboutToOpen(doc: Document) = { /* Some default implementation */ 34}
  // Primitives operations
  def canOpen(fileName: String): Boolean
  def create(fileName: String): Document
  def read(doc: Document)
}
{% endhighlight %}

As you can see, the method `openDocument` defines a _template_ of the algorithm needed to open a document. For this reason, it is called a _template method_. Whereas, all other methods are abstract or provide defaults implementation for a task. The formers are called _primitive operations_; The latter is called _hook operation_, instead.

Implementing an application that can open CSV file means to extend the `GenericApplication` class, implementing correctly the methods that were left abstract.

{% highlight scala %}
class CsvApplication() extends GenericApplication {
  def canOpen(fileName: String): Boolean = { /* Some implementation */ }
  def create(fileName: String): Document = { /* Some implementation */ }
  def read(doc: Document) = { /* Some implementation */ }
}
{% endhighlight %}

### Drawbacks
One of the main consequence of the original Template Method pattern is _code reuse_. In this blog, we don't like code reuse. In [Dependency](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html) post, we learned that we should avoid code reuse in favor of _behaviour reuse_. Code reuse leads to an increase of dependency between classes, resulting in architectures, which components are tightly coupled.

Bad. Really, bad.

Moreover, the abuse of the Template Method pattern tends to generate deep hierarchies of _concrete_ classes. Let's return to our example. One day, your boss asks you to extend the above code to handle more than one type of storage. He wants the software to be able to read both from local filesystem and the cloud, or from distributed filesystems like HDFS.

Easy, you think. We already have a primitive method, `create` (`read` is reserved to unmarshal bytes into object-oriented structures), that I can override to allow my program to read from any storage. You are a smart boy.

{% highlight scala %}
class CsvApplication() extends GenericApplication { /* ... */ }
class CsvOnHDFSApplication() extends GenericApplication { 
  /* ... */ 
  override def create(fileName: String): Document = { /* Some implementation */ }
}
class CsvOnCloudApplication() extends GenericApplication { 
  /* ... */ 
  override def create(fileName: String): Document = { /* Some implementation */ }
}
// And so on...
{% endhighlight %}

At some point, you need to change the `canOpen` in the  `CsvApplication`. Unfortunately, the new implementation does not fit the behavior in the `CsvOnCloudApplication` class. Then, you need to override also the `canOpen` method in this class. One day, you will have to change the implementation of another primitive method in some other class in your hierarchy. And the story will repeat over and over again.

Do you see the problem? You miss the maintainability of your classes. You do not know which behavior is implemented in which class. Every time you modify a class, it is difficult to predict which other classes you need to change.

What can we do at this point? Which alternatives do we have?

> Favor object composition over class inheritance

The above _motto_, coined by the GoF, remembers us one of the principles that should guide us every time we develop something using an object-oriented programming language.

## Template Method pattern: the right way
It is not difficult to image how we are going to change the original pattern to use composition, instead of inheritance. We are going to extract all the behaviors enclosed in _primitive methods_ into dedicated classes. So, in our example, we can identify the following types.

{% highlight scala %}
// Subtypes of this trait give access to different types of storages
trait Storage {
  def openDocument(fileName: String): Try[Document]
  def canOpen(fileName: String): Boolean
  def create(fileName: String): Document
}
// Different types of file format can be read simply defining 
// subtypes of this trait
trait Reader {
  def read(doc: Document): Document
}
{% endhighlight %}

In this way, our original Template type becomes the following.

{% highlight scala %}
class Application(storage: Storage, reader: Reader) {
  def openDocument(fileName: String): Try[Document] = {
    Try {
      if (storage.canOpen(fileName)) {
        val document = storage.create(fileName)
        storage.aboutToOpen(document)
        reader.read(document)
      }
    }
  }  
}
{% endhighlight %}

Whoa! We do not need an abstract type anymore! We do not need to use class inheritance either! Everything can be resolved using object composition during the instantiation of the `Application` class.

{% highlight scala %}
val hdfsCsvApplication = new Application(new HdfsStorage(), new CsvReader())
val cloudCsvApplication = new Application(new HdfsStorage(), new CsvReader())
// And so on...
{% endhighlight %}

As a plus, we reduced the dependencies of the overall architecture, avoid all those annoying subclasses.

### The Programmable Template Method
Most of the modern programming languages have functions as first-class citizens. A  variant of the Template Method pattern uses lambas as implementations of primitive methods. I like to call it _Programmable Template Method_.

The trick is passing functions in place of primitive methods during object instantiation. So, let's turn our original `Application` trait into a concrete class receiving some functions as input during the construction process.

{% highlight scala %}
class Application(
  // Functions used to 'program' the behaviour of the application
  canOpen: String => Boolean,
  create: String => Document,
  read: Document => ()
) {
  // Template method
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
  def aboutToOpen(doc: Document) = { /* Some default implementation */ 34}
}

val app = new Application(
    (filename: String) => /* Some implementation */,
    (filename: String) => /* Some implemenation */,
    (doc: Document) => /* Some implementation */
  )
{% endhighlight %}

In this way, you have not to declare a new type for each behavior you want to implement, just create a lambda expression.

### The Scala way
So far, so good. We all know that the Scala language can do better than a simple object composition. Scala has some very powerful constructs that allow us to use some smarter versions of the Template Method pattern.

#### Mixins
The first construct we are going to use is Scala _mixins_. Mixins are traits which are used to compose a class. Using mixins, we can add some code to a class without using inheritance. It's a concept very similar to the composition.

Revamping the first Application trait we presented in this post, we can use mixins to implement the Template Method also in this way.

{% highlight scala %}
trait Application {
  def openDocument(fileName: String): Try[Document]
  def canOpen(fileName: String): Boolean
  def create(fileName: String): Document
  def aboutToOpen(doc: Document) = { /* Some default implementation */ 34}
  def read(doc: Document)
}
// Hdfs storage implementation
trait HdfsStorage {
  def openDocument(fileName: String): Try[Document] = /* HDFS implementation */
  def canOpen(fileName: String): Boolean = /* HDFS implementation */
  def create(fileName: String): Document = /* HDFS implementation */
}
// Csv reader implementation
trait CsvReader {
  def read(doc: Document): Document = /* CSV implementation */
}
// Creating the application using the proper implementations
val hdfsCsvApplication = new Application with HdfsStorage with CsvReader
{% endhighlight %}

As you can see, we can mix any trait during the instantiation process of another trait. We achieved composition using mixins, using a native approach.

#### Functional programming: currying and partial application
Many of us abandoned the Object-Oriented path after the Functional way enlighted them. Is the template method pattern worth also in Functional programming? Well, in some way the answer is "yes".

In functional programming, there is a technique called _currying_. The name "currying" becomes from the mathematician Haskell Curry, who was the first to use this technique.

> Currying transforms a multi-argument function so that it can be called as a chain of single-argument functions

So, having a function with at least two input arguments. For the sake of simplicity, let's take a function that sums two integers

{% highlight scala %}
def sum(a: Int, b: Int): Int = a + b
{% endhighlight %}

Then, using currying, we can derive from `sum` its curryfied form.

{% highlight scala %}
def curryfiedSum(a: Int)(b: Int): Int = a + b
{% endhighlight %}

If we pass only the first parameter to `curryfiedSum`, the result will be a new function with only one parameter left. In mathematical jargoun, the function was _partially applied_. Using this approach, we can quickly obtain a new function that sums five to any integer number.

{% highlight scala %}
def sumFive(x: Int): Int = curryfiedSum(5)
{% endhighlight %}

Well, now that we have given the necessary background, we can reveal which is the link between currying and partial application and the Template Method Pattern. Let's define the aggregate function, that repeatedly applies a function to a list of integer numbers. Using this function, we can identify two new functions, the factorial n! and the sum of all numbers up to n.

{% highlight scala %}
def aggregate(id: Int, op: (Int, Int) => Int)(n: Int): Int =
  if (n == 0) id 
  else op(aggregate(neutral, op)(n-1), n)
// Factorial of integers from n to 0
def factorial = aggregate(1, _ * _)_
// Summing integers from n to 0
def sum = aggregate(0, _ + _)_
{% endhighlight %}

As you can see, the function `aggregate` defines the body the general algorithm, whereas the first two arguments define the variable parts of the algorithm. Template method and primitive operations: It's the same approach of the Template Method pattern. 

Do you see it? Awesome!

## Conclusions
Summarizing, we started presenting the original Template Method design pattern, as shown by the GoF. Following the principle _prefer composition over inheritance_, we highlighted all the problems with the original approach. Then, we brought some procedures that correct the original issue. Using composition, lambdas, and curryfication, we brought the Template Method pattern in the 21st century.

## References
- [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html)
- [Inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)
- [Chapter: Introduction (page 20). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Chapter: Template Method Pattern (page 325). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 1995, 
Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
- [Class composition with mixins](https://docs.scala-lang.org/tour/mixin-class-composition.html)
- [Functional design patterns, Part 1](https://www.ibm.com/developerworks/library/j-ft10/)