---
layout: post
title:  "Code looks like a Chain"
date:   2016-12-07 08:09:21
comments: true
categories: design programming java scala di
tags:
    - design
    - programming
    - java
    - scala
    - dependency injection
summary: "Para, para, Code lools like a Chain - the Aerosmith sang many years ago. No? Did not they sing so? May I remember
          wrong? As you can imagine, in this post we will talk about the Chain of Responsibility design pattern. This pattern is
          not one of the most popular among the patterns defined by the *Gang of Four*, but modern dependency injection frameworks
          give us the possibility to implement it in a vey smartly and freshly way. Let's see how."
social-share: true
social-title: "Code looks like a Chain"
social-tags: "Java, Scala, programming, design"
---

"Para, para, Code looks like a Chain" the Aerosmith sang many years ago. No? Did not they sing so? May I remember
wrong? As you can imagine, in this post we will talk about the Chain of Responsibility design pattern. This pattern is
not one of the most popular among the patterns defined by the *Gang of Four*, but modern dependency injection frameworks
give us the possibility to implement it in a vey smartly and freshly way. Let's see how.

#### Introduction
Disclaimer: There is nothing new with this pattern. I wrote this post to remember the kind of solution we will analyze 
in a moment. A colleague of mine used it days ago and, despite I also have used it many time in the past, I did not
notice immediately that this pattern could be used to solve that problem.

#### The classic pattern
The Chain of Responsibility pattern is a *behavioural design pattern*. It was firstly defined in the book *Design 
Patterns*, wrote by the *Gang of Four*. The intent of the pattern is the following.

> Avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request.
  Chain the receiving objects and pass the reqbubuest along the chain until an object handles it.

The class diagram relative to the pattern is the following.

![Class diagram of the Chain of Responsibility design pattern ](http://rcardin.github.io/assets/2016-12-05/chain-of-responsibility-class-diagram.gif)

Loose coupling is accomplished through the definition of a standard interface by which respond to clients' requests. In the above
diagram it is represented by abstract type `Handler`. The ability to have more than one object to respond to a request is
simply accomplished by creating a chain of objects that implement the above interface. Each object owns an instance of the next link in the chain.
The `successor` attribute satisfies this scope.

When called, each handler verifies if it is able to respond to the request. If it can, it perform the operations requested. At this point we can
have many different implementations, which differ by the request forward policy. We can implement a policy that stops the request
in the chain once a `ConcreteHandler` has stated that can handle it. In this case, the implementation of the `handleRequest`
method will be the following.

{% highlight java %}
if (/* The request can be successfully handled */) {
    // Handle the request
} else {
    successor.handleRequest(request);
}
{% endhighlight %}

On the other side, we can forward the request to the next handler in the chain, whether the current handler is able to fulfill it
or not.

{% highlight java %}
if (/* The request can be successfully handled */) {
    // Handle the request
}
successor.handleRequest(request);
{% endhighlight %}

The building process of the chain will be something similar to the following.

{% highlight java %}
Handler chain = new ConcreteHandler1(new ConcreteHandler2(new ConcreteHandler3()));
chain.handleRequest(request);
{% endhighlight %}

Inside the JDK implementation, the pattern is applied at least in two points:

 - Implementation of the *logging* mechanisms: [`java.util.logging.Logger#log()`](https://docs.oracle.com/javase/8/docs/api/java/util/logging/Logger.html)
 - Implementation of the filtering mechanisms of http requests and responses in the Servlet specification: [`javax.servlet.Filter#doFilter()`](http://docs.oracle.com/javaee/7/api/javax/servlet/Filter.html)

#### The advent of dependency injection
As in many other situations, the definition of the dependency injection pattern changed the tune. Let's see how
to use DI features to modernize the Chain of Responsibility pattern.

First of all, we need a feature that, in some ways, all the DI libraries implement: *multibindings*. Basically, using
this feature it is possible to provide an instance of all subtypes of a type, simply by trying to inject a
collection of that type.

Let's have for example the following type system.

{% highlight java %}
interface Shop {}
class PetShop implements Shop {}
class Grocery implements Shop {}
class Drugstore implements Shop {}
// And so on...
{% endhighlight %}

Now, we will define a new type `ShoppingCenter`, that owns an instance of all subtypes of `Shop`. Using dependency
injection, we can achieve this goals simply by injecting a collection of `Shop` inside `ShoppingCenter`.

{% highlight java %}
class ShoppingCenter {

    private final Set<Shop> shops;

    @Inject
    public void ShoppingCenter(Set<Shop> shops) {
        this.shops = shops;
    }

    // Class body using shops
}
{% endhighlight %}

Simply as f\*\*k! Obviously, every dependency injection library has its own ways to configure the injector to resolve
such situation. In Spring, using *auto-discovery* feature, you have to provide very little configuration. In Guice the story
is little more complicated, but the final result is the same.

#### Modern implementations of CoR
To summarize a little: We have seen the Chain of Responsibility design pattern in its classical form; We have seen
*multibindings* feature provided by dependency injection libraries; In the final step through the nirvana we will see
how to mix this two concept together.

First of all, we need a slightly different implementation of the original CoR design pattern. Let's introduce a new
type, the `ChainHandler`. The responsibility of this type is to own the whole chain and to expose to the clients a single
point of access to the functions offers by the chain itself.

{% highlight java %}
class ChainHandler {

    private final Set<Handler> handlers;

    @Inject
    public void ChainHandler(Set<Handler> handlers) {
        this.handlers = handlers;
    }

    // Pass the request to each handler of the chain
    public void handle(final Request request) {
        handlers.forEach(h -> h.handle(request));
    }
}
{% endhighlight %}

Taking advantage of dependency injection, adding a new `Handler` implementation requires no changes in the existing
code at all. This means that virtually no regression tests need to be performed. On the other side, it is a little
bit more difficult (but not impossible) to impose an order of execution of `Handler`s inside the chain.

#### Warnings
As in many other patterns, it is important to focus which is the role of the classes that build the pattern.
Which responsibilities will you give to a concrete `Handler`? Will you develop the *business logic* of the application
directly inside the body of that `Handler`?

At first, many of us will provide the above solution. It is not inherently wrong. However, this kind of design
limits the riusability of the code and violates the famous **Single Responsibility Principle**.

For example, let's imagine that we have to implement a system that enrich information of a financial
transaction. The enrichment process is develop using the CoR pattern. One of the possible enrichment could be
the insertion of the payee country derived from an IBAN or a BIC code. Then, let's defined a `CountryPayeeEnricher`.

At a first glance, one could be tempted to insert the code that extract the country information directly inside the body
of the `CountryPayeeEnricher` class. But, what if we have to reuse this function in another point of our application (or
in another application at all)? It is far a better solution to resume *composition* principle, putting the code inside a
dedicated type, let's say `PayeeService`.

{% highlight java %}
class PayeeService {
    public Country deriveCountryFromPayee(String payee) {
        // Code that extract the country information from the
        // input payess
    }
    // Omissis...
}

class CountryPayeeEnricher implements Enrichment {

    private PayeeService payeeService;

    @Inject
    public void CountryPayeeEnricher(PayeeService payeeService) {
        this.payeeService = payeeService;
    }

    public void handle(Transaction tx) {
        Country country = payeeService.deriveCountryFromPayee(tx.getPayee());
        tx.setCountry(country);
        // ...or something like this
    }
}
{% endhighlight %}

In this way, we end up with two types with different responsibilities: `PayeeService` type, that offers reusable services
directly connected to payee information; `CountryPayeeEnricher` type that offers a standardized access to the services
offered by the previous type.

#### The Scala way
For sake of completeness, I also want to talk about the implementation of the CoR pattern in the Scala language. As many
other design patterns, there is an implementation of the CoR pattern built in the language: *partial functions*. As the theory
stated, a partial function is a function that is defined only for some subset of values of its domain. In Scala, such
kind of functions have a specific type, `PartialFunction[T, V]`.

Partial functions in Scala are defined used *pattern matching* statements. In the following example, the value `fraction`
is not defined for zero value.

{% highlight scala %}
val fraction: PartialFunction[Int, Int] = {
  case d: Int if d != 0 =>  42 / d
}
{% endhighlight %}

If the definition sets are multiple, you can have more than one `case` clause. If you think of every `case` clause
as a condition to satisfy in order to apply a function (the *handler* in CoR, do you see it?), you get the CoR pattern
again.

{% highlight scala %}
case class Request(val value: String) { /* ... */ }
val someStupidFunction: PartialFunction[Request, String] = {
  case Request(42) => "The final answer"
  case Request(0) => "You know nothing, John Snow"
  case Request(666) => "Something strange is going on in here"
  //. ..
}
{% endhighlight %}

Then, a partial function can be thought as a simple chain of handlers. Clearly, there are some additional constraints
you have to fulfill to use CoR in such a way. In fact,

> - You won't be able to store any metadata on each handler
> - You can't remove handlers from the chain
> - You can't inspect the handler to display or pretty-print it
>
>  If you do not need to do these things, pattern-matching PartialFunctions works great.

#### References
 - [Chapter: Chain of Responsibility (pag. 223). Design Patterns, Elements of Reusable Object Oriented Software, GoF, 
   1995, Addison-Wesley](http://www.amazon.it/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)
 - [Design Patterns in the JDK](http://www.briandupreez.net/2010/11/design-patterns-in-jdk.html)
 - [Spring, The IoC container - @Autowired](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/beans.html#beans-autowired-annotation)
 - [Google Guice, Multibindings](https://github.com/google/guice/wiki/Multibindings)
 - [Scala partial functions (without a PhD)](http://blog.bruchez.name/2011/10/scala-partial-functions-without-phd.html)
 - [Old Design Patterns in Scala](http://www.lihaoyi.com/post/OldDesignPatternsinScala.html#chain-of-responsibility)