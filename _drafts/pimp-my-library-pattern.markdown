---
layout: post
title:  "The Pimp My Library Pattern"
date:   2019-11-20 14:15:12
comments: true
categories: jvm programming design-pattern
tags:
    - jvm
    - programming
    - design
    - patterns
summary: "Which is the main problem you have as a developer when you use libraries that you don't own? You can't change them. If something is missing in the public API of a library, there is no chance to extend it. Using some good old object-oriented programming, you can overcome this problem writing a lot of boilerplate code. In the JVM ecosystem, modern programming languages, such as Scala, Kotlin or Groovy, try to give a solution to library extension, the Pimp My Library Pattern."
social-share: true
social-title: "The Pimp My Library Pattern"
social-tags: "functional, Programming, Java, Scala, Kotlin, Groovy"
math: false
---

Which is the main problem you have as a developer when you use libraries that you don't own? You can't change them. If something is missing in the public API of a library, there is no chance to extend it. Using some good old object-oriented programming, you can overcome this problem writing a lot of boilerplate code. In the JVM ecosystem, modern programming languages, such as Scala, Kotlin or Groovy, try to give a solution to library extension, the Pimp My Library Pattern. Let's go, and see what I am talking about.

## The problem

Let's begin with a very extreme example. Imagine you want to add a method `Integer` type in Java that allows you to transate an int into an instance of the `java.time.Period` class. For whom that don't know this class, a `Period` represents a period of time, using days, months, years, and so on.

All that we want to achive is having something like the following.

{% highlight java %}
final Period days = Integer.valueOf(42).days();
{% endhighlight %}

In more evolved languages, such like Scala or Kotlin, the above statement would look like the following.

{% highlight scala %}
val days = 42.days;
{% endhighlight %}

In Java you have no such many possibility to achieve the goal. Basically, since we cannot nor we want to modify directly the `Integer` type, and [we do not want to use inheritance on a concrete type](http://rcardin.github.io/design/programming/oop/fp/2018/07/27/the-secret-life-of-objects-part-2.html), the only
left possibility is to implement a method somewhere that receive in input an `Integer` and returns a `Period`.

{% highlight java %}
class Integer2Period {
    private Integer integer;
    Period days() {
        return Period.ofDays(integer);
    }
}
var days = new Integer2Period(42).days();
{% endhighlight %}

Meh. We used a _wrapper_, or some variance of the Object Adapter Pattern but we are very far from the objective we originally had.

Let's see how modern JVM languages, such us Kotlin, Scala and Groovy give an answer to this problem.

## Scala

Scala was the language that first introduced the _Pimp My Library_ pattern. The pattern was introduced by the Scala language's dad, Martin Odersky, in his article [Pimp my Library](https://www.artima.com/weblogs/viewpost.jsp?thread=179766), in the far 2006. 

The pattern allows to extend a type adding methods to it without using any form of inheritance. It is possible to add any method to any type both in the standard library, or in any external types. This is exactly what we are searching for, since we want to add a method to the `Int` type without extending from it.

The implementation of the pattern in the Scala language is based on the use of _implicit conversions_. First of all, we need to declare an `implicit` class that allows the compiler to convert our basic type into a new type that add the method we want to have. In our case, the basic type is the `Int` type.

{% highlight scala %}
package object extension { 
  implicit class ExtendedInt(val integer: Int) extends AnyVal {
    def days = Period.ofDays(integer)
  }
}
{% endhighlight %}

Inside the package `extension`, or in any package, explicitly importing the package `extension`, we can use the method defined in the type `ExtendedInt` as it was defined for the `Int` type.

{% highlight scala %}
val days = 42.days;
{% endhighlight %}

The tricks that make the magic are two: 

1. Using a package object, the `ExtendedInt` type will be automatically imported by the compiler in all the files that belong from it.
2. The class `ExtendedInt` is declared as `implicit`.
3. The class `ExtendedInt` is a subclass of the type `AnyVal`. From Scala 2.10, extending from `AnyVal` allows the compiler to perform some code optimisations. It's called _Custom Value Classes_.

The pattern is extensively used in the definition of the standard library. All the type defined with the suffix `Ops` implement the pattern. Have a look at the [`StringOps`](https://www.scala-lang.org/api/2.12.2/scala/collection/immutable/StringOps.html) type for an example.

## Kotlin

Also the newbie JVM-based language, Kotlin, has its own implementation of the _Pimp my library_ pattern. In Kotlin gergon, the pattern implementation it's called _Extension functions_. The pattern was introduced in the language with the fact in mind that the majority of library a Kotlin developer could use were writtern in Java. So, these libraries were not designed to work using Kotlin idioms, nor the they would never be translated in Kotlin.

The syntax needed to declare an _extension function_ is less verbose than the syntax used in the Scala language ( :O ).

{% highlight kotlin %}
fun Integer.days(): Period = Period.ofDays(this)
{% endhighlight %}

In our example, the `Integer` type is also called the _receiver type_. Whereas, the `this` reference on the right of the assignment symbol is called the _receiver object_. The `this` reference refers to the integer instance on which the extension method is called. To preserve encapsulation, you can access only to the public methods of the receiver object.

The compiler does not import the extension methods by default. As any other Kotlin entity, you need to explicitly import them before the use.

Under the hood, the compiler translates every extension method in a `static` method having the receiver object as its first parameter. The name of the enclosing class is equal to the name of the file that declares the extension function.

Suppose that we declared the `Integer.days` function in a file called IntegerUtil.kt, then the Kotlin compiler compile our code into a static method inside a class called `IntegerUtilKt`.

{% highlight java %}
class IntegerUtilKt {
    public static Period days(Integer receiver) {
        return Period.ofDays(receiver);
    }
}
{% endhighlight %}

## Groovy

## References

- [Pimp my Library (M. Odersky)](https://www.artima.com/weblogs/viewpost.jsp?thread=179766)
- [Pimp My Library (D. Sfregola)](https://danielasfregola.com/2015/06/08/pimp-my-library/)
- [Chapter 3: Defining and calling function. Kotlin in Action, Dmitry Jemerov and Svetlana Isakova, 2017,
Manning Publications](https://www.manning.com/books/kotlin-in-action)
