---
layout: post
title:  "Optional Is the New Mandatory"
date:   2019-10-06 14:15:12
comments: true
categories: functional programming types
tags:
    - functional
    - programming
    - jvm
summary: "Since the beginning of the 'computer programming era', developers had searched for a solution for one of the biggest mistake made in computer science, the invention of the null reference. Since functional programming became mainstream, a solution to this problem seems to arise, the use of the optional type."
social-share: true
social-title: "Optional Is the New Mandatory"
social-tags: "functional, Programming, Java, Scala, Kotlin"
math: false
---

Since the beginning of the "computer programming era", developers had searched for a solution for one
of the biggest mistake made in computer science, the invention of the [null reference](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/). Since functional programming became mainstream, a solution to this problem seems to arise, the use of the _optional_ type. In this post, I will analyze how this type is used in different programming languages, trying to understand the best practices to apply in each situation.

## Returning the nothing
Let's start from a concrete example. Think about a repository that manages users. One classic method of such type is the method `def findById(id: String): User`, whatever an `id` could be. This method returns the user that has the given id, or nothing if no such user exists in your persistence layer.

How can we represent the concept of _nothing_? It is common to use the _null reference_ to accomplish this task.

{% highlight scala %}
val maybeUser = repository.findById("some id")
val longName = maybeUser.name + maybeUser.surname
{% endhighlight %}

The problem is not in returning a null reference itself. The problem is using a reference containing a `null`. The above code, written in Scala, rises a `NullPointerException` during the access of the methods `name` and `surname` if the `user` reference is equal to `null`.

So, what's a possible solution? A first attempt can be to return a `List[User]`. The signature of the method becomes the following, `def findById(id: String): List[User]`. An empty list means that there is no
user associated with the given `id`. A not empty list means that there is a user associated with the given `id`. The
problem is that the user is _exactly one_, whereas the semantic of lists if to store zero or more elements.

So using a list seems to be convenient, but not semantically correct. The use of an empty list to represent the
nothing produces programs that are hard to read (violating the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment)) and to maintain.

However, the idea behind the use of lists is perfect. How can we refine it?

## The Option type

The answer to our question is in the type that Scala calls `Option`. Other programming languages call this type in different ways, such as `Optional` in Java, or `Maybe` in Haskell.

The `Option[T]` type is just like a list that can be empty or can contain exactly one element. It has two subtypes that are `None` and `Some[T]`. So, an `Option` object that contains something is an instance of the `Some[T]` subtype, whereas an empty option is an instance of `None`. There is only one instance of the `None` type that in Scala is defined as an `object`.

`Option` is indeed an [Algebraic Data Type](https://nrinaudo.github.io/scala-best-practices/definitions/adt.html), but the definition of such a concept is behind the scope of this post.

It is possible to use the factory method `Option(value: T)`, declared in the `Option` `object` to build a new instance of an `Option` class. The factory method will create a new `Option` instance: If `value` is equal to `null`, then the `None` object is returned, `Some(value)` otherwise.

Using the `Option` type, our previous method changes its signature in `def findById(id: String): Option[User]`. Ok, interesting. However, how can I use the user value contained inside the option type? There are many ways to do that. Let's look at them.

### Getting the value out of the option type
One of the possible choices is to try to get the value out of the option. The API of the `Option` type lists the methods `isDefined` and `get`. The first check if an option contains a value, and the second allows you to extract that value. The usage pattern raising from the use of the above methods is the following.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
var longName: String;
if (maybeUser.isDefined) {
  longName = maybeUser.get.name + maybeUser.get.surname
}
{% endhighlight %}

Despite the use of a `var` reference, the above pattern is to avoid. If you call the `get` method on a `None` object, you will obtain an error at runtime. So, you don't improve the code that much from the version that checks for the `null` directly.

For this reason, the Scala `Option` type provides a variant of the `get` method, which is `getOrElse`. This method allows you to provide a default value to return in case of an empty option. Imagine that our `User` type provides a `gender: Options[String]` method, which eventually returns the gender of a user. It is possible to use the following safer pattern using `getOrElse`.

{% highlight scala %}
val maybeUser: User = // Retrieving a user
val gender: String = maybeUser.gender.getOrElse("Not specified")
{% endhighlight %}

### Using pattern matching
In Scala, it is possible to use _pattern matching_ on Algebraic Data Types. The `Option` type is not an exception in this sense. Although it is not such idiomatic, this approach does what it promises us — raw and straightforward.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val longName: String = maybeUser match {
  case Some(user) => user.name + user.surname
  case None => "Not defined"
}
{% endhighlight %}

Using pattern matching is a little more verbose than using the next approach I am going to show you, but it is still more elegant than checking the existence of a value using the `isDefined` method.

### Using the Option type as a list
The suggested approach by the Scala community is to use the `Option` type, just as if it was a list. This approach takes advantage of the fact that the `Option` type is indeed a _monad_ (also, in this case, explaining what a monad is in functional programming is behind the scope of this post).

The `Option` type, like lists, exposes a lot of useful methods to transform e manage the `Option` inner value, without even the need to extract it. Among the others, such methods are the `map`, `flatMap` and `filter` functions.

The `map` method allows you to transform the value owned by an `Option` object if any.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val longName: Option[String] = maybeUser.map(user => user.name + user.surname)
{% endhighlight %}

The `flatMap` method allows you to compose functions that in turn, return an object of type `Option`.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
// Using a simple map function, we obtain an Option[Option[String]]...uhh, ugly!
val gender: Option[String] = maybeUser.flatMap(user => user.gender)
{% endhighlight %}

Finally, the `filter` method allows you to discard any value that does not fulfil a given predicate.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val maybeNotARiccardo: Option[User] = maybeUser.filter(user => user.name != "Riccardo")
{% endhighlight %}

All the above methods, if invoked on a `None` object, return `None` automatically, preserving any method call concatenation.

Note that we can combine the use of the `map`, `flatMap` and `filter` method using _for-comprehension_, giving to our code a look more like Haskell. 

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
val maybeNotARiccardo: Option[User] = maybeUser.filter(user => user.name != "Riccardo")
val maybeTheGenderOfANoRiccardo: Option[String] = maybeNotARiccardo.flatMap(user => user.gender)
{% endhighlight %}

The above code can be rewritten using a simple `for...yield` expression.

{% highlight scala %}
val maybeTheGenderOfANoRiccardo: Option[String] =
  for {
    user <- repository.findById("some id")
    gender <- user.gender if user.name != "Riccardo")
  } yield (gender)
{% endhighlight %}

Last but not least, if you need to apply some _side-effects_ if a value is present in an `Option` object, you can use the `foreach` method. This function cycles on the single value of the option, if present, and executes a procedure.

{% highlight scala %}
val maybeUser: Option[User] = repository.findById("some id")
maybeUser.foreach(user => println(s"$user.name $user.surname"))
{% endhighlight %}

## Option type in other languages

The `Option` type is not present only in Scala. Many programming languages widely use it.

### Java
Since Java 8, the language introduced the `Optional<T>` type in the mainstream JVM language. It is very similar to its Scala cousin.

Also, the Java API defines different factory methods to build a new instance of `Optional`: `Optional.of` which throws an exception if the given value is `null`, and `Optional.ofNullable`, that returns an `Optional.empty` in case of `null` value. 

A small difference if the behaviour of the `map` method. If the function used by `map` returns a `null` value, the method interprets this as the `Optional.empty` value. The `map` method behaves like the `flatMap` method, in this particular case.

{% highlight java %}
Optional<User> maybeUser = repository.findById("some id");
Optional<String> maybeUserName = maybeUser.map(user -> {
    if ("Riccardo".equals(user.getName()) {
        return user.getName();
    } else {
        return null;
    }
});
{% endhighlight %}

The above code returns an `Optional.empty` value if the name of the user is equal to the `String` `"Riccardo"`.

Another interesting method of the Java `Optional` type is `orElseThrow`. This method allows us to choose which exception to rising in case of an empty `Optional` object.

It worth reporting the answer that Brian Goetz gave to the StackOverflow question, [Should Java 8 getters return optional type?](https://stackoverflow.com/questions/26327957/should-java-8-getters-return-optional-type).

> NEVER call `Optional.get` unless you can prove it will never be `null`; instead use one of the safe methods like `orElse` or `ifPresent`. In retrospect, we should have called get something like `getOrElseThrowNoSuchElementException` or something that made it far clearer that this was a highly dangerous method that undermined the whole purpose of Optional in the first place. Lesson learned.

### Kotlin
The Kotlin programming language does not have built-in support for something similar to the Scala `Option` type or the Java `Optional` type. The reason why is mainly that the language support _compile-time_ null checking.

In Kotlin every type has two variants. Continuing our previous example, Kotlin defines both the `User`, and the `User?` type. A reference of the first type cannot be `null`, whereas an instance of the `User?` type can also hold the `null` value. Any non-nullable type is a child type of the corresponding nullable type.

In other words, Kotlin attempts to solve the problem by forcing you to handle null references. Kotlin forces you to handle the exception or to take full responsibility. For example, you can't use the dereferencing operator, the `.` (dot), if you are managing _nullable_ type. The following code won't even compile.

{% highlight kotlin %}
val maybeUser: User? = repository.findById("some id")
val longName = maybeUser.name + maybeUser.name
{% endhighlight %}

Kotlin tries to prevent `NullPointerException` for you. The _safe call_ operator, `.?` must be used in this case. It checks if the reference is `null`, and if it is not, it calls the method on it, propagates the `null` value otherwise.

{% highlight kotlin %}
val maybeUser: User? = repository.findById("some id")
val longName: String? = maybeUser.?name + maybeUser.?name
{% endhighlight %}

The power of the _safe call_ operator shines with chained methods calls. In this case, it also reminds very strictly the use of the methods `map` and `flatMap` defined in the `Option` type.

{% highlight kotlin %}
val maybeGender: String? = 
  repository.findById("some id").?gender
{% endhighlight %}

The above method is equal to the following Java counterpart.

{% highlight java %}
String maybeGender = 
    repository.findById("some id")
              .flatMap(user -> user.getGender())
              .getOrElse(null);
{% endhighlight %}

If you don't mind about NPEs, you can always use the `!!.` operator, that does not perform any check on reference nullability.

Finally, also Kotlin defines the same behaviour of the `orElse` method in Scala or Java for nullable types, using the _Elvis operator_, `?:`. If we want to return a particular value of the gender if something is `null` during the gender resolution process, we can proceed as the following code shows.

{% highlight kotlin %}
val maybeTheGender: String = 
  repository.findById("some id").?gender ?: "Not defined"
{% endhighlight %}

As you can see, the type of the last `maybeTheGenderOfANoRiccardo` variable is not _nullable_ anymore, because the _elvis operator_ eliminates the possibility for the reference to be `null`.

## Conclusions

In this post, we analyzed a modern solution to deal with the `null` value and in general, the absence of information. We started to see how the Scala programming language defines `Option[T]` type, listing the best practice of its use. Then, we saw how the good old Java approaches to the problem, the `Optional<T>` type, concluding that it is very similar to the solution proposed in Scala.

Finally, we looked at a different solution, the one proposed by Kotlin. Kotlin does not have any optional type, because it tries to handle the nullability of references at compile-time. Although this approach is exquisite and as powerful as the approaches proposed in Scala and Java, it poorly composes with the other constructs used in functional programming. For this reason, Kotlin has its library for functional structures, such as the optional type, which is [ARROW](https://arrow-kt.io/).

**Bonus**: Are you planning to use an option value as a parameter for a method? Please, don't do that ([Why should Java 8's Optional not be used in arguments](https://stackoverflow.com/questions/31922866/why-should-java-8s-optional-not-be-used-in-arguments)).

## References
- [Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/)
- [The Neophyte's Guide to Scala Part 5: The Option type](https://danielwestheide.com/blog/the-neophytes-guide-to-scala-part-5-the-option-type/)
- [Should Java 8 getters return optional type?](https://stackoverflow.com/questions/26327957/should-java-8-getters-return-optional-type)
- [Chapter 2: Functional programming in Kotlin: An overview. The Joy of Kotlin, Pierre Yves Saumont, 2019, Manning Publications](https://www.manning.com/books/the-joy-of-kotlin)