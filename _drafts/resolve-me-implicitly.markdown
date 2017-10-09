---
layout: post
title:  "Resove me, Implicitly"
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

Now that we know how to declare what kinds of objects a component needs to work, we also need a technique to resolve these object. And its here that the "_injection_" part comes into play.
