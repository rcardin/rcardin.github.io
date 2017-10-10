---
layout: post
title:  "Resolve me, Implicitly"
date:   2017-10-15 13:22:45
comments: true
categories: design scala
tags:
    - design pattern
    - dependency injection
    - scala
summary: "Reading my posts you can easily find that there is a topic that cares about me a lot: Dependency management in development process. There is a feature of the Scala programming language that I liked since the beginning. Without any external library, it is possible to successfully implement vary  depenency injection mechanisms. In the past I wrote about the Cake pattern. Now it's time to talk about dependenct injection through the use of implicits. Let this race starts!"
social-share: true
social-title: "Resove me, Implicitly"
social-tags: "Scala, designpattern, programming"
math: false
---

Reading my posts you can easily find that there is a topic that cares about me a lot: Dependency management in development process. There is a feature of the Scala programming language that I liked since the beginning. Without any external library, it is possible to successfully implement vary  depenency injection mechanisms. In the past I wrote about the [Cake pattern](http://rcardin.github.io/design/2014/08/28/eat-that-cake.html). Now it's time to talk about dependenct injection through the use of implicits. Let this race starts!

## The problem: dependency injection

### Dependency
I have wrote many times about this topic, then I will not make a long introduction. To summarize, every time a component needs to send a message to another component, a dependency is defined between them. Components may be packages, classes, functions and so on. Messages are always associated with methods or functions calls. Dependency between two components can have many levels of strenght. If you want a complete explanation of the dependency concept, have a look at this post: [Dependency.](http://rcardin.github.io/programming/oop/software-engineering/2017/04/10/dependency-dot.html).
For sake of completeness, let's give an example of the simpliest type of dependendcy: Association.

{% highlight scala %}
class A {
  // ...
}
class B(val a: A) {
  // ...
}
{% endhighlight %}

An association means that a class is *made of* references to other classes.

### Dependency injection
Other than the coupling between components that derives from dependencies, the problem with dependencies is also the process that a component has to take in place to resolve them. Dependencies resolution is a complex problem. To treat it successfully, the best thing to do is to apply the _divide et impera_ principle.

Dependency resolution can be divided into two different tasks: dependencies declarations and resolution.

First of all, a component should be able to declare its dependencies. A component should be able to scream "_Hey, anybody listening, I need these f@cking classes to work!_". There are many ways a component may choose to declare its dependencies. The most accreditated by the developer community is _constructor injection_.

Using constructor injection, a component declares its dependencies as the parameters of its constructor.

{% highlight scala %}
class Connection (private val mainActor: ActorSelection) {
  // Some cool stuff
}
{% endhighlight %}

In the above example, the class `Connection` is screaming to everyone that she needs an instance of an `ActorSelection` class to work properly.

if you want to know which other types of dependency declarations are available, please have a look at the post [Resolving your problems with Dependency Injection](http://rcardin.github.io/programming/software-design/java/scala/di/2016/08/01/resolve-problems-dependency-injection.html).

Now that we know how to declare which kinds of objects a component needs to work, we also need a technique to resolve these object. And its here that the "_injection_" part comes into play.

## Resolving dependency in Scala
In the JVM ecosystem there are a lot of libraries that implement the injection tecnique. We have many alternatives, such like the following.

1. Spring framework
2. Guice
3. Weld
4. Dagger

There is also a _Java Specification Requests_ dedicated to dependency injection, the [JSR 330](https://jcp.org/en/jsr/detail?id=330). As you can see, the JDK needs external libraries to implement the dependency injection mechanism.

But, **Scala is different**. The Scala programming language has a reacher semantic that allows to implement dependency injection mechanisms without the need of any kind of external libraries. As you we will see in a moment, this tecnique applies both to classes and to functions. That's awsome! 

In the past I wrote about the [Cake Pattern](http://rcardin.github.io/design/2014/08/28/eat-that-cake.html), which implements dependency resolution using traits and [self-type](https://docs.scala-lang.org/tour/self-types.html). This time I want to write about a dependency injection mechanisms that uses two other features of Scala, _function curryfication_ and _implicits_.

### Function curryfication
As you know, Scala is also quoted as a functional programming language. Functional programming languages have many nice features. One of these features is function curryfication.

Let's take for example a function that takes two arguments:

{% highlight scala %}
def mul(x: Int, y: Int) = x * y
{% endhighlight %}

We can refactor this function into a new one, that takes only one parameter and return a new function.

{% highlight scala %}
def mulOneAtTime(x: Int) = (y: Int) => x * y
{% endhighlight %}

To multiply to integers you have to call the last function in the following way.

{% highlight scala %}
mulOneAtTime(7)(6) // Returns 42
{% endhighlight %}

We said the function `mulOneAtTime` is the curryfication of the original function `mul`. 

> In mathematics and computer science, currying is the technique of translating the evaluation of a function that takes multiple arguments (or a tuple of arguments) into evaluating a sequence of functions, each with a single argument.

There is a shortcut for defining such curried function in Scala:

{% highlight scala %}
def mulOneAtTime(x: Int)(y: Int) = x * y
{% endhighlight %}

The languages save us from defining a lot of intermediate functions, giving us some vanilla-flavored syntactic sugar.

I suppose that you are asking why are we talking about currying instead of dependency injection. Be patient.

### Implicits
TODO

## Refereces
- [JSR 330: Dependency Injection for Java](https://jcp.org/en/jsr/detail?id=330)
- [Tour of Scala - Self-type](https://docs.scala-lang.org/tour/self-types.html)
- [Chapter 12: Higher-Order Functions, Section 12.8: Currying. Scala for the Impatient, 	
Cay S. Horstmann, 2010, Addison Wesley](https://www.amazon.it/Scala-Impatient-Cay-S-Horstmann/dp/0321774094)
- [Currying](https://en.wikipedia.org/wiki/Currying)