---
layout: post
title:  "It's a Kind of Magic: Kinds in Type Theory"
date:   2019-02-15 13:45:21
comments: true
categories: functional programming types
tags:
    - functional
    - programming
    - types
summary: "I am not an expert of functional programming, nor of type theory. I am currently trying to enter
in the world of Haskell, after I mess around the Scala world for a while. When I read about Kinds,
I remember I was surprise, and a little bit scared. Is it possible that types have types? And,
what does this mean? In this little introductory post, I will try to explain myself what I understood
during my journey through kinds in my Haskell travelling,"
social-share: true
social-title: "It's a Kind of Magic: Kinds in Type Theory"
social-tags: "functional, Programming, types, Scala, Haskell"
math: false
---

I am not an expert of functional programming, nor of type theory. I am currently trying to enter
in the world of Haskell, after I mess around the Scala world for a while. When I read about Kinds,
I remember I was surprise, and a little bit scared. Is it possible that types have types? And,
what does this mean? In this little introductory post, I will try to explain myself what I understood
during my journey through kinds in my Haskell travelling.

## The beginning of all the sadness

To make thinks simple, we start from the Java programming language. In Java you can define a class 
(a type), which take as input parameter another type. It is called a _generic class_. For example, think to the `List<T>` type. There is a _type parameter_ `T` that one should provide to the compiler when dealing with a `List` to obtain a concrete and usable type. Then, we have `List<Integer>`, `List<String>`, `List<Optional<Double>>`, and so on.

What about if we provide not a concrete type aa the value of the type parameter? What about `List<List>`, for example? Well, the Java compiler transforms this type into the more safer `List<List<Object>>`, warning you that you are using `List` in a non generic way. And yes, `List<Object>` is an awful concrete type.

So, it seems that Java type system allows to fill type parameters only with concrete types. Fair enough. And the Scala programming language? Well, Scala introduces in the game a feature that is called **Higher Kinded Types (HKT)**. HKTs allows us to define things like the following.

{% highlight scala %}
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
{% endhighlight %}

What does that strange symbols, `F[_]`, mean? It means that `Functor` is a generic type, which type parameter can be filled with any other generic type that accept one and only one type parameter, i.e. `List[T]`, `Option[T]`, and so on. Differently from Java, Scala accepts both concrete types and types that remain generic, that is whose type parameters are not binded. If you think about it, it's like partial application in function, in which not all the parameters are given at one time.

The Scala vision of types came from how the type system of Haskell was thought. Also in Haskell you can define a _functor_.

{% highlight haskell %}
class Functor f where  
    fmap :: (a -> b) -> f a -> f b 
{% endhighlight %}

Different sysntax, same semantic.

So, in some programming languages we need a way to distinguish between the available types. As we just saw, there are types that are concrete, and types that needs some information to become concrete. Type theory comes in help to us, with **Kinds**, i.e. types of types.

## Kinds
TODO

## References

- [Scala: Types of a higher kind](https://www.atlassian.com/blog/archives/scala-types-of-a-higher-kind)
- [Making Our Own Types and Typeclasses](http://learnyouahaskell.com/making-our-own-types-and-typeclasses#the-functor-typeclass)