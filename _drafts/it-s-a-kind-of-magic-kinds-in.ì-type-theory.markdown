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

But, first we need to specify the small bricks we need to built the road through kinds definition. And so we will do.

## Some fancy title
### Values

Starting from the beginning we found _values_. Values are the information or data that our programs evaluate. Examples of values are things like `1`, `"hello"`, `true`, `3.14`, and so on. Each value in a program belongs to a type. A value can be assigned to a name, that is called a _variable_.

### Types

_Types_ give information to our program about how to treat values at runtime. In other terms, they set _contraints_ to values. Saying that a variable has type `bool`, `e: bool`,it means that it can have only two values, that are `true` or `false`.

> So, a type is a compile time constraint on the values an expression can be at runtime.

In statically typed programming languages, the definition of types for values is made at compile time. You must give to each value (or variable) a type while your writing your code. In dinamically typed programming languages, the type of a value is determined at runtime, that is during execution of the program. 

In functional programming languages, in which functions are first-order citizens, each function has an associated type too. For example, the function `sum`, that takes two integers and returns their sum, has type `(Int, Int) => Int` in Scala, or `Int -> Int -> Int` in Haskell.

### Type constructors

As we previously said, there can be types that are _parametric_. _Generic types_ uses _type parameters_ to exploit this feature. So, we can define a type using a type parameter such as `List[T]`, where `T` can be instantiated with any concret type we want.

Using type parameters is an attempt to justify the fact that, let's say, `List[Int]` are very similar to `List[String]`. It is nothing more than a way to generify and abstract over types.

So, in the ssme way (value) constructors take as input a list of values to generate new values, _type constructors_ take as input a type to create new types. `List[T]`, `Map[K, V]`, `Option[T]`, and so on are all classified as type constructors. In Java, we call them _generics_. In C++, they call them _templates_.

Now, we have two different "kinds" of types: The former is represented by concrete types; The latter by type constructors. We have just said that we need to define the type of a type :O

## Kinds

_Kinds_ are the types of types, more or less. To be more formal, a kind is actually more of an arity specifier. We use the character `*` to refer to kinds.

`*` is the kind of simple and concrete types. A concrete type is a type that doesn't take any type parameters.

What about type constructors? Let's take a step back. A (value) constructor is nothing more that a function that takes a tuple of values in input and returns a new value.

{% highlight scala %}
class Person(name: String, surname: String) = {
    //...
}
{% endhighlight %}

The above is nothing more than a function of type `(String, String) => Person`

Now, lift this concept to type constructors: values are now represented by types, and (value) constructors by type constructors. Then, a type constractor is a function that takes in input a tuple of types and produce a new type.

Returning to our `Functor` type class, we have the following.

{% highlight haskell %}
class Functor f where  
    fmap :: (a -> b) -> f a -> f b 
{% endhighlight %}

By the definition, `f` receives a concrete type in input, and produces a concrete type. So, `Functor`, as `List`, `Option` and so on, has kind `* -> *`. In other words, it is a function that takes a concrete type in input and produce a concrete type. `Map[K, V]` has kind `* -> * -> *`, because it needs two concrete types in input to produce a concrete type.

TALK ABOUT CURRYING

## References

- [Scala: Types of a higher kind](https://www.atlassian.com/blog/archives/scala-types-of-a-higher-kind)
- [Making Our Own Types and Typeclasses](http://learnyouahaskell.com/making-our-own-types-and-typeclasses#the-functor-typeclass)
- [Kind (type theory)](https://en.wikipedia.org/wiki/Kind_(type_theory))
- [Correct terminology in type theory: types, type constructors, kinds/sorts and values](https://softwareengineering.stackexchange.com/questions/255878/correct-terminology-in-type-theory-types-type-constructors-kinds-sorts-and-va)