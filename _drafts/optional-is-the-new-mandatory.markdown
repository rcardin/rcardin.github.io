---
layout: post
title:  "Optional Is the New Mandatory"
date:   2019-10-03 14:45:12
comments: true
categories: functional programming types
tags:
    - functional
    - programming
    - monads
    - jvm
    - optional
summary: "Since the beginning of the 'computer programming era', developer had searched for a solution for one of the biggest mistake made in computer science, the invention of the null reference. Since the time when functional programming became mainstream, a solution to this problem seems to arise, the use of the optional type."
social-share: true
social-title: "Optional Is the New Mandatory"
social-tags: "functional, Programming, Java, Scala, Haskell"
math: false
---

Since the beginning of the "computer programming era", developer had searched for a solution for one
of the biggest mistake made in computer science, the invention of the [null reference](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/). Since the time when functional programming became mainstream, a solution to this problem seems to arise, the use of the _optional_ type. In this post I will analyze this type in different programming languages, trying to understand the best practices to apply in each situation.

## Returning the nothing
Let's start from a concrete example. Think about a repository that manages users. One classic method of such type is the method `def findById(id: String): User`, whatever an `id` could be. This method can return the user that has the given id, or nothing if no such user exists in your persistence layer.

How can we represent the concept of _nothing_? It is common to use the _null reference_ to accomplish this task.

{% highlight scala %}
val user = repository.findById("some id")
val longName = user.name + user.surname
{% endhighlight %}

The problem is not in returning a null reference itself. The problem is using a reference containing a `null`. The above code, written in Scala, rises a `NullPointerException` during the access of the methods `name` and `surname`, if the `user` reference is equal to `null`.

So, what's a possible solution? A first attempt can be to return a `List[User]`. The signature of the method becomes the following, `def findById(id: String): List[User]`. An empty list means that there is no
user associated to the given `id`. A not empty list means that there is a user associated to the given `id`. The
problem is that the user is _exactly one_, whereas the semantic of lists if to store zero or more elements.

So using a list seems to be convenient, but not semantically correct. The use of an empty lists to represent the
nothing produces programs that are hard to read (violating the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)) and to maintain.

However, the idea behind the use of lists is very good. How can we refine it?

## The Option type

The answer to our question is in the type that Scala calls `Option`. Other programming languages call this type in different ways, such as `Optional` in Java, or `Maybe` in Haskell.

Basically, the `Option[T]` type is just like a list that can be empty or can contain exactly one element. It has two subtypes, that are `None` and `Some[T]`. So, an option object that contains something is an instance of the `Some[T]` subtype, whereas an empty option is an instance of `None`. To tell the truth, there is only one instance of the `None` type, that in Scala is defined as an `object`.

`Option` is indeed an [Algebraic Data Type](https://nrinaudo.github.io/scala-best-practices/definitions/adt.html) but the definition of such concept is behind the scope of this post.

Using the `Option` type, our previous method changes its signature in `def findById(id: String): Option[User]`. Ok, interesting. But how can I use the user value contained inside the option type? There are many ways to do that. Let's look at them.

### Getting the value out of the option type
One of the possible choices is to try to get the value out of the option. The API of the `Option` type lists the methods `isDefined` and `get`. The first check if a option contains a value, and the second allows you to extract that value. The usage pattern raising from the use of the above methods is the following.

{% highlight scala %}
val user: Option[User] = repository.findById("some id")
var longName: String;
if (user.isDefined) {
  longName = user.get.name + user.get.surname
}
{% endhighlight %}

Despite the use of a `var` reference, the above pattern is to avoid. If you call the `get` method on a `None` object, you will obtain an error at runtime. So, you don't improve the code that much from the version that checks for the `null` directly.

For this reason, the Scala `Option` type provides a variant of the `get` method, which is `getOrElse`. This method allows you to provide a default value to return in case of an empty option. Imagine that our `User` type provides a `gender: Options[String]` method, which eventually returns the gender of a user. Using `getOrElse` it possible to safely use the following pattern.

{% highlight scala %}
val user: User = // Retrieving a user
val gender: String = user.gender.getOrElse("Not specified")
{% endhighlight %}

### Using pattern matching
In Scala it is possible to use _pattern matching_ on Algebraic Data Types. The `Option` type is not an exception in this sense. Althought it is not such idiomatic, this approach does what it promises us. Nitty gritty.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val longName: String = maybeUser match {
  case Some(user) => user.name + user.surname
  case None => "Not defined"
}
{% endhighlight %}

Using pattern matching is a little more verbouse than using the next approach I am going to show you but it is still more elegant than checking the existence of a value using the `isDefined` method.

### Using the option type as a list
The suggested approach by the Scala community is to use the `Option` type just like if it was a list. This approach takes advantage of the fact that the `Option` type is indeed a _monad_ (also in this case, explaining what a monad is in functional programming is behind the scope of this post).

The `Option` type, as lists, exposes a lot of useful methods to transform e manage the option internal type, without even the need to extract it. Among the others, such methods are the `map`, `flatMap` and `filter` functions.

The `map` method allows you to transform the value owned by an option object, if any.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val longName: Option[String] = maybeUser.map(user => user.name + user.surname)
{% endhighlight %}

The `flatMap` method allows you to compose functions that in turn return an object of type `Option`.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
// Using a simple map function, we obtain an Option[Option[String]]...uhh, ugly!
val gender: Option[String] = maybeUser.flatMap(user => user.gender)
{% endhighlight %}

Finally, the `filter` method allows you to discard any value that does not fulfill a given predicate.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val maybeNotARiccardo: Option[User] = maybeUser.filter(user => user.name != "Riccardo")
{% endhighlight %}

All the above methods, if invoked on a `None` object, return `None` automatically, preserving any method call concatenation.

Note that we can combine the use of the `map`, `flatMap` and `filter` method using _for-comprehension_, giving to our  code a look more like Haskell. 

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val maybeNotARiccardo: Option[User] = maybeUser.filter(user => user.name != "Riccardo")
val maybeTheGenderOfANoRiccardo: Option[String] = maybeNotARiccardo.flatMap(user => user.gender)
{% endhighlight %}

Using _for-comprehension_ construct, the above code can be rewritten using a simple `for...yield` expression.

{% highlight scala %}
val maybeTheGenderOfANoRiccardo: Option[String] =
  for {
    user <- repository.findById("some id")
    gender <- user.gender if user.name != "Riccardo")
  } yield (gender)
{% endhighlight %}

## References
- [Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/)
- [The Neophyte's Guide to Scala Part 5: The Option type](https://danielwestheide.com/blog/the-neophytes-guide-to-scala-part-5-the-option-type/)