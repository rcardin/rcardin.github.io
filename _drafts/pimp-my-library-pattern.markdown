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
        // Returns a period representation of the attribute integer
    }
}
var days = new Integer2Period(42).days();
{% endhighlight %}

Meh. We used a _wrapper_, or some variance of the Object Adapter Pattern but we are very far from the objective we originally had.

Let's see how modern JVM languages, such us Kotlin, Scala and Groovy give an answer to this problem.

## Kotlin

## Scala

## Groovy

## References
