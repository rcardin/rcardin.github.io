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
Let's start from a concrete example. Think about a repository that manages users. One classic method of such type is the method `findById(id: String): User`, whatever an `id` could be. This method can return the user that has the given id, or nothing if no such user exists in your persistence layer.

How can we represent the concept of _nothing_? It is common to use the _null reference_ to accomplish this task.

{% highlight scala %}
val user = repository.findById("some id")
val longName = user.name + user.surname
{% endhighlight %}

The problem is not in returning a null reference itself. The problem is using a reference containing a `null`. The above code, written in Scala, rises a `NullPointerException` during the access of the methods `name` and `surname`, if the `user` reference is equal to `null`.

So, what's a possible solution? A first attempt can be to return a `List[User]`. The signature of the method becomes the following, `findById(id: String): List[User]`. An empty list means that there is no
user associated to the given `id`. A not empty list means that there is a user associated to the given `id`. The
problem is that the user is _exactly one_, whereas the semantic of lists if to store zero or more elements.

So using a list seems to be convenient, but not semantically correct. The use of an empty lists to represent the
nothing produces programs that are hard to read (violating the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)) and to maintain.

However, the idea behind the use of lists is very good. How can we refine it?

## The Option type

The answer to our question is in the type that Scala calls `Option`. Other programming languages call this type in different ways, such as `Optional` in Java, or `Maybe` in Haskell.

Basically, the `Option[T]` type is just like a list that can be empty or can contain exactly one element. It has two subtypes, that are `None` and `Some[T]`. So, an option that contains something is an instance of the `Some[T]` subtype, whereas an empty option is an instance of `None`. To tell the truth, there is only one instance of the `None` type, that in Scala is defined as an `object`.

`Option` is indeed an [Algebraic Data Type](https://nrinaudo.github.io/scala-best-practices/definitions/adt.html) but the definition of such concept is behind the scope of this post.

## References
- [Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/)