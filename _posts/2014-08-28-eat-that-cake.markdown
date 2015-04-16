---
layout: post
title:  "Eat that cake!"
date:   2014-08-28 22:47:00
comments: true
categories: design
tags:
    - design pattern
    - dependency injection
    - scala
summary: "We know it, managing dependencies between software components within a project of magnitude
          rather than trivial could become a hell if not planned properly Scala provides a mechanism
          to resolve dependencies similar to DI, the *cake pattern*. Unlike DI pattern in other languages,
          such as Java, C++, etc ... the cake pattern can be used directly with language constructs
          available in Scala."
social-share: true
social-title: "Eat that cake! Cake pattern explained"
social-tags: "scala, programming"
---
# Introduction
We know it: managing dependencies between software components within a project of magnitude rather
than trivial could become a hell if not planned properly. Many of you will wonder why it is necessary
to dwell too much on this topic. Responses to this question are two, namely:

1. low grade of coupling;
2. high grade of cohesion.

The minimization of dependencies between software components enables greater maintainability, and
enhances software testability, cleanliness and elegance. A high cohesion allows us to join one of
the basic principles of software development, the **DRY** principle, "*Don't Repeat Yourself*". So, the
minimization of dependencies is a goal to be pursued at all levels.

For example, let’s analyze a classic software problem: a repository class (`UserRepository`), which
enables access to information stored on database, and a service class (`UserService`) that allows the
use of this information to other components.

![Class diagram showing a direct dependency between two classes](http://localhost:4000/assets/cp_1.png)

Clearly, the direct association between these two elements creates a high level of coupling between them.
In particular `UserService` is responsible for creating an instance of `UserRepository`, tying the evolution
of `UserService` in the evolution of the `UserRepository` code. In addition, it is complex to design any
unit tests, which would require the replacement of a `UserRepository` with a mock in `UserService` code.

You can improve the situation by abstracting the `UserRepository` component in an interface and changing
the dependency in the `UserService` towards this interface.

![Class diagram showing a better solution using an interface](http://localhost:4000/assets/cp_2.png)

This new configuration enables the use of **dependency injection** (DI) pattern. DI is a design pattern
that helps to separate the behavior of a component from the responsibility for resolution of its
dependencies.

For strongly typed object-oriented languages, you must use an external framework that handles and resolves
the dependencies. These dependencies are suitably configured by the developer and framework uses these
information to operate like a factory, managing the complete life cycle of software components.

In Java, for example, the most commonly used DI frameworks are [Spring](http://spring.io/) and
[Google Guice](https://github.com/google/guice).

# The Cake pattern

Scala provides a mechanism to resolve dependencies similar to DI, the *cake pattern*. Unlike DI pattern in
other languages, such as Java, C++, etc ... the cake pattern can be used directly with language constructs
available in Scala.

#### Traits

In Scala the cake pattern is made possible by the presence of the construct of the trait. A trait is similar
to a Java interface, but unlike the latter it can have both attributes, both methods completely implemented.

A trait also has a key feature for the cake pattern: can be "added" to any component as a mixin. In this way
the attributes and methods of the trait are added to those of the component. This makes it possible to
implement some kind of multiple inheritance, that is not allowed in other programming languages.

![Class diagram showing the meaning of traits](http://localhost:4000/assets/cp_3.png)

#### Self-type annotation

The Self-type annotation is a special construct that allows you to declare the dependencies of a component
from one or more trait, i.e. which trait should be associated with the component using mixin. For example,
consider the following class `BarAble` and trait `FooAble`.

{% highlight scala %}
trait FooAble {
  def foo() = "I am a foo!"
}
class BarAble { this: FooAble =>   // self-type annotation
  def bar = "I am a bar and " + foo()
}
{% endhighlight %}

Using the notation `this: => FooAble` we mean that an object of class `BarAble` must be associated with
trait `FooAble` using mixin.

{% highlight scala %}
object Main {
  def main(args: Array[String]) {
    val barWithFoo = new BarAble with FooAble   // mixin
    println(barWithFoo.bar())
  }
}
{% endhighlight %}

In order to instantiate the object `barWithFoo`, the compiler checks the dependencies declared through mixin
and if these are not met it will provide the following error:

> class BarAble cannot be instantiated because it does not conform to its self-type BarAble with FooAble

#### The full recipe

Trait and self-type annotation are the foundation of the cake pattern. Return to the main problem, namely the
resolution of dependency between the class `UserService` and the class `UserRepository`. An elegant solution
to the problem must not modify these two classes, maintaining isolated and distinct business aspects from
more technical aspects. For this reason, we define two traits whose aim is to enclose the original classes
in components more malleable, like layers of a cake.

![A visual representation of the cake pattern](http://localhost:4000/assets/cp_4.jpg)

{% highlight scala %}
trait UserRepositoryComponent {
  val userRepository: UserRepository
  class UserRepository {
    def findAll() = Array[User]()   // fake implementation
    def save(user: User) = "Saving a user..."   // fake implementation
  }
}
trait UserServiceComponent { this: UserRepositoryComponent =>
  val userService: UserService
  class UserService {
    def findAll() = userRepository.findAll
    def save(user: User) = userRepository.save(user)
  }
}
{% endhighlight %}

In each of the new trait original classes are made available through an internal attribute. Note that an attribute
(`val`) has been preferred to a function (`def`) because both service and repository are *Singleton* classes: they
require no more than one active instance within an application. Also, note that both traits are abstract, since
internal class instances are not initialized.

Note in particular the latter trait, i.e. `UserServiceComponent`. Through the use of a self-type annotation is
declared the dependency upon trait `UserRepositoryComponent`, through which `UserService` class can access the
`userRepository`. In case you need to declare multiple dependencies this process can be repeated, using a notation
such as

{% highlight scala %}
this: A with B with C =>
{% endhighlight %}

which `A`, `B` and `C` are traits similar to `UserRepositoryComponent`.

So we have built a mechanism for declaring dependencies among components. We need to take the last few steps and
implement the real mechanism of dependency injection: the implementation of abstract trait; their composition, which
allows the resolution of dependencies.

Let’s build a configuration object, implementing concrete instances of classes `UserRepository` and `UserService`.

{% highlight scala %}
object ComponentRegistry extends
  UserServiceComponent with UserRepositoryComponent {
  // Dependency injection
  val userRepository = new UserRepository
  val userService = new UserService
}
{% endhighlight %}

The dependencies are resolved in one single place and can be modified using subclassing, simplifying unit testing
and mocking.

In case you want to replace the dependency to the `UserRepository` class with a pure interface, you can provide a
trait within `UserRepositoryComponent`, which will be concretely implemented later.

{% highlight scala %}
trait UserRepositoryComponent {
  def userRepository: UserRepository
  trait UserRepository {
    def findAll()
    def save(user: User)
  }
}
{% endhighlight %}

#### References

- [Real-World Scala: Dependency Injection (DI)](http://jonasboner.com/2008/10/06/real-world-scala-dependency-injection-di/)
- [Cake pattern in depth](http://www.cakesolutions.net/teamblogs/2011/12/19/cake-pattern-in-depth)
- [Dependency Injection in Scala: Extending the Cake Pattern](http://www.warski.org/blog/2010/12/di-in-scala-cake-pattern/)
- [Dependency injection vs. Cake pattern](http://www.cakesolutions.net/teamblogs/2011/12/15/dependency-injection-vs-cake-pattern)
- [Cake Pattern Practices](http://vpatryshev.blogspot.com.au/2012/06/cake-pattern-practices.html?m=1)
- [Cake Pattern in Scala / Self type annotations / Explicitly Typed Self References – explained](https://coderwall.com/p/t_rapw)