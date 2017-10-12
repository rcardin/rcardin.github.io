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
Implicits are another awsome feature of the Scala programming language. Hated by someone and feared by most, implicits can be applied to resolve many kind of problems, from automatic conversion between two types, to automatic resolution of dependencies. What we are going to explain is how _implicit parameters_ work in Scala.

The parameters of a function (or a method) can be marked with the keyword `implicit`. In this case the _compiler_ will automagically looks for a value to supply to the parameters marked as `implicit` with the function call. Here is a simple example, taken directly from the Scala SDK:

{% highlight scala %}
object Future {
  def apply[T](body: => T)(implicit execctx: ExecutionContext): Future[T]
}

// Usage - thanks to Stanislav Spiridonov for the funny example :)
import scala.concurrent._
import scala.concurrent.ExecutionContext.Implicits.global

val beast = hell.createBeastFor(credentials)
val f: Future[Option[Blood]] = Future {
  beast.rape(user)
}
{% endhighlight %}

In the above example, the parameter `execctx` of method `apply` is automatically resolved and provided by the compiler to the program. How does the Scala compiler know how to resolve  `implicit` parameters? Compiler search for an object that have the same type of an `implicit` parameter and that is declared using the word `implicit`. In the case of `execctx` in the `object scala.concurrent.ExecutionContext.Implicits` is defined the constant `global`.

{% highlight scala %}
implicit lazy val global: ExecutionContext = ???
{% endhighlight %}

During implicits resolution, the compiler search for `var/val/def` that are available in the same scope of the function that as some parameters marked as `implicit`. 

Implicit resolution is also one of the reasons why Scala compiler is so slow. In fact, implicit resoltion has not any impact on runtime performances, as it is done completly at compile time. For a more detailed explanation on implicit resolution, have a look at [Implicit Parameter Resolution](http://daily-scala.blogspot.it/2010/04/implicit-parameter-resolution.html)

So far, so good. We just added another piece to our dependency injection puzzle. Now it's time to put all the ingredients togheter and bake a tasty dependency injection cake.

### Dependency Injection using implicits
Until now, we learnt how to currying a function; We learnt how implicits work in Scala. It's time to put them all togheter.

As you probably already undestood, we can use implicits to instuct the compiler to automatically resolve components dependencies. Let's start from types. We have already learnt that dependencies of a class should be declared in its constructor. We learnt that for every parameter of a function or method that is marked as `implicit`, the compiler search for an object of the same type in the class scope.

{% highlight scala %}
trait UserService {
  def findById(id: String): User
}
class SimpleUserService(implict repository: UserRepository) extends UserService {
  override def findById(id: String): User = repository.findUser(id)
}
{% endhighlight %}

In the above example, we declared a `SimpleUserService` class, which declares as its unique external dependency an instance of the type `UserRepository`. The dependency is marked as `implicit`. To let the compiler properly resolve this dependency, we have to provide an object of type `UserRepository` marked as `implicit` in the same scope of the clients of the class `SimpleUserService`.

We have declared also a `UserService` trait over the class, such that clients of this class have not to deal with the boilerplate code of implicits.

We have mainly two possibilities to provide this information to the compiler. The first is to use a _configuration trait_ to mix with every class that declares an implicit dependency.

{% highlight scala %}
trait Conf {
  implicit val repository = new MongoDbUserRepository
}
object UserController extends Conf
class UserController {
  // I know, this code is not the best :P
  def findById(id: String) = new UserService().findById(id)
}
{% endhighlight %}

We chose to mix the trait into the _companion object_ of the class to avoid replication of the instances of the variable `repository`.

The second approach is to use a package object placed in the same package of the class `UserController`.

{% highlight scala %}
package controllers {
  class UserController {
    // I know, this code is not the best :P
    def findById(id: String) = new UserService().findById(id)
  }
}
package object controllers {
  implicit val repository = new MongoDbUserRepository
}
{% endhighlight %}

Using the latter approach, the definition of the class `UserController` is not polluted by any exoteric extensions. The drawback is that it becomes harder to trace how each implicit paramenter is resolved by the compiler.

## Refereces
- [JSR 330: Dependency Injection for Java](https://jcp.org/en/jsr/detail?id=330)
- [Tour of Scala - Self-type](https://docs.scala-lang.org/tour/self-types.html)
- [Chapter 12: Higher-Order Functions, Section 12.8: Currying. Scala for the Impatient, 	
Cay S. Horstmann, 2010, Addison Wesley](https://www.amazon.it/Scala-Impatient-Cay-S-Horstmann/dp/0321774094)
- [Currying](https://en.wikipedia.org/wiki/Currying)
- [Make Them Suffer / Scala Implicit Hell](http://spiridonov.pro/2015/10/14/scala-implicit-hell/)
- [Implicit Parameter Resolution](http://daily-scala.blogspot.it/2010/04/implicit-parameter-resolution.html)
- [WHERE DOES SCALA LOOK FOR IMPLICITS?](http://docs.scala-lang.org/tutorials/FAQ/finding-implicits.html)
- [Available spec is silent on the fact that the implicit scope of a.A includes package object a](https://issues.scala-lang.org/browse/SI-4427)