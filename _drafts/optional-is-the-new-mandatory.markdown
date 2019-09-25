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
Let's start from a concrete example. Think about a repository that manages users. One classic method of such type is the method `findById(id: String)`, whatever an `id` could be. This method can return the user that has the given id, or nothing if no such user exists in your persistence layer.

How can we represent the concept of _nothing_? It is common to use the _null reference_ to accomplish this task.

{% highlight scala %}
val user = repository.findById("some id")
val longName = user.name + user.surname
{% endhighlight %}

The problem is not in returning a null reference itself. The problem is using a reference containing a `null`. The above code, written in Scala, rises a `NullPointerException` during the access of the methods `name` and `surname`, if the `user` reference is equal to `null`.


## References
- [Null References: The Billion Dollar Mistake](https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/)