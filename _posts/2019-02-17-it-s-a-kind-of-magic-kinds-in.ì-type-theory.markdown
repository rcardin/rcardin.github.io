---
layout: post
title:  "It's a Kind of Magic: Kinds in Type Theory"
date:   2019-02-17 21:15:21
comments: true
categories: functional programming types
tags:
    - functional
    - programming
    - types
summary: "I am not an expert of functional programming, nor type theory. I am currently trying to enter the world of Haskell after I mess around the Scala world for a while. When I read about Kinds,
I remember I was surprised, and a little bit scared. Is it possible that types have types? So
what does this mean? In this little introductory post, I will try to explain to myself what I understood during my journey through kinds in my Haskell travelling."
social-share: true
social-title: "It's a Kind of Magic: Kinds in Type Theory"
social-tags: "functional, Programming, types, Scala, Haskell"
math: false
---

I am not an expert of functional programming, nor type theory. I am currently trying to enter the world of Haskell after I mess around the Scala world for a while. When I read about Kinds,
I remember I was surprised, and a little bit scared. Is it possible that types have types? So
what does this mean? In this little introductory post, I will try to explain to myself what I understood
during my journey through kinds in my Haskell travelling.

## The beginning of all the sadness

To make things simple, we start from the Java programming language. In Java, you can define a class 
(a type), which take as input parameter another type. It is called a _generic class_. For example, think to the `List<T>` type. There is a _type parameter_ `T` that one should provide to the compiler when dealing with a `List` to obtain concrete and usable types. Then, we have `List<Integer>`, `List<String>`, `List<Optional<Double>>`, and so on.

What about if we provide not a concrete type as the value of the type parameter? What about `List<List>`, for example? Well, the Java compiler transforms this type into the more safer `List<List<Object>>`, warning you that you are using `List` in a non-generic way. And yes, `List<Object>` is an awful concrete type.

So, it seems that the Java type system allows filling type parameters only with concrete types. Fair enough. What about the Scala programming language? Well, Scala introduces in the game a feature that is called **Higher Kinded Types (HKT)**. HKTs allow us to define things like the following.

{% highlight scala %}
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
{% endhighlight %}

What does that strange symbol, `F[_]`, mean? It means that `Functor` is _something_ (a type class, indeed), which type parameter can be filled with any other generic type that accepts one and only one type parameter, i.e. `List[T]`, `Option[T]`, and so on.

The Scala vision of types comes from how the type system of Haskell was thought. Also in Haskell, you can define a _functor_.

{% highlight haskell %}
class Functor f where  
    fmap :: (a -> b) -> f a -> f b 
{% endhighlight %}

Different sysntax, same semantic.

So, in some programming languages, we need a way to distinguish between the available types. As we just saw, some types are concrete, and types that need some information to become concrete. Type theory comes in help to us, with **Kinds**, i.e. types of types.

However, first, we need to specify the small bricks we need to build the road through kinds' definition.

## Types, and other stuff
### Values

Starting from the beginning, we found _values_. Values are the information or data that our programs evaluate. Examples of values are things like `1`, `"hello"`, `true`, `3.14`, and so on. Each value in a program belongs to a _type_. A value can be assigned to a name, that is called a _variable_.

### Types

_Types_ give information to our program about how to treat values at runtime. In other terms, they set _contraints_ to values. Saying that a variable has type `bool`, `e: bool`, it means that it can have only two values, that is `true` or `false`.

> So, a type is a compile-time constraint on the values an expression can be at runtime.

In statically typed programming languages, the definition of types for values is made at compile time. You must give to each value (or variable) a type while you are writing your code. In dynamically typed programming languages, the type of values is determined at runtime, that is during the execution of the program. 

In functional programming languages, in which functions are first-order citizens, each function has an associated type too. For example, the function `sum`, that takes two integers and returns their sum, has type `(Int, Int) => Int` in Scala, or `Int -> Int -> Int` in Haskell.

### Type constructors

As we previously said, there can be "types" that are _parametric_. _Generic types_ uses _type parameters_ to exploit this feature. So, we can define a "type" using a type parameter such as `List[T]`, where `T` can be instantiated with any concrete type we want.

Using type parameters is an attempt to justify the fact that, let's say, the behaviour of a `List[Int]` is very similar to the behaviour of a `List[String]`. It is nothing more than a way to generify and abstract over types.

So, in the same way (value) constructors take as input a list of values to generate new values, _type constructors_ take as input a type to create new types. `List[T]`, `Map[K, V]`, `Option[T]`, and so on are all classified as type constructors. In Java, we call them _generics_. In C++, they call them _templates_.

Now, we have two different "kinds" of objects dealing with types: The former is represented by concrete types; The latter by type constructors. We have just said that we need to define the type of a type :O

## Some Kind (of monsters)

_Kinds_ are the types of objects that are related to types, more or less. A kind is more of an _arity_ specifier. In their simplest form, we use the character `*` to refer to kinds.

`*` is the kind of simple and concrete types. A concrete type is a type that doesn't take any parameters.

What about type constructors? Let's take a step back. A (value) constructor is nothing more than a function that takes a tuple of values in input and returns a new value.

{% highlight scala %}
class Person(name: String, surname: String) = {
    //...
}
{% endhighlight %}

The above is nothing more than a function of type `(String, String) => Person`

Now, lift this concept to type constructors: Values are now represented by types, and (value) constructors by type constructors. Then, a type constructor is a function that takes in input a tuple of types and produces a new type.

Think about a list. It's definition is `List[T]`. So, it takes a type in input to produce a concrete type. It is similar to a function having only one parameter. `List`, `Option` and so on, has kind `* -> *`. `Map[K, V]` has kind `* -> * -> *`, because it needs two concrete types in input to produce a concrete type.

The fact that type constructors are similar to functions is underlined by the use of _currying_ to model situations, in which more than one parameter takes place.

In Haskell, you can ask the kind of a type to the compiler, using the function `:k`.

{% highlight shell %}
ghci> :k List  
List :: * -> *  
{% endhighlight %}

However, a question should arise into your mind: What the hell are kinds useful for? The answer is _typeclasses_.

### Type Classes

A type class is a concept that not all the programming languages have. For example, it is present in Haskell, and (in some way) Scala, but not in Java.

> A type class defines some behaviour, and the types that can behave in that way are made instances of that type class. So when we say that a type is an instance of a type class, we mean that we can use the functions that the type class defines with that type.

A type class is very similar to the concept of `interface` in Java. In Scala, it is obtained using a `trait`. In Haskell, there is a dedicated construct that is the `class` construct. In Haskell, there are type classes for a lot of features that a type could have: The `Eq` type class marks all the types that be checked for equality; The `Ord` type class marks all the types that can be compared; The `Show` type class is used by the types that can be pretty-printed in the standard output.

Our `Functor` that we defined earlier is, in fact, a type class. The `fmap` function defines the behaviour of the type of class.

Type classes are not native citizens of Scala, but they can be simulated quite well. The example below declares the type class `Show`.

{% highlight scala %}
trait Show[A] {
  def show(a: A): String
}
{% endhighlight %}

While in Haskell type classes have native support, so the compiler recognises them and generates automatically the binary code associated with them, in Scala you need to revamp some intricated mechanisms, involving _implicits_ (see [Type classes in Scala](https://blog.scalac.io/2017/04/19/typeclasses-in-scala.html) for more details on the topic).

So, to let a type to belong to a type class contained in the standard library, in Haskell you have simple to declare it in the type definition, using the `deriving` keyword.

{% highlight haskell %}
data List a = Empty | Cons a (List a) deriving (Show, Read, Eq, Ord) 
{% endhighlight %}

In general, to make a type to belong to a type class you have to provide the implementation of the methods (behaviours) of the type class. The following code shows a possible implementation of the `Functor` type class by the `Maybe` type (`Option` in Scala). As you can see, there are dedicated constructs of the language, as `instance` and `where`, to support type classes.

{% highlight haskell %}
instance Functor Maybe where  
    fmap f (Just x) = Just (f x)  
    fmap f Nothing = Nothing 
{% endhighlight %}

Anyway, describing abstract behaviour, type classes are inherently abstract too. The way the abstraction is achieved is using type parameters. Usually, type classes declare some constraints on the type represented by the type parameter.

The problem is that type classes can declare some strange type parameters. **Reasoning on the kind of types, allows us to understand which type can be used to fulfil the type parameter.**

Let's do a simple example. Looking back at the `Functor` type class definition, the type `f` must have a kind `* -> *`, which means that the type class requests types that take only one parameter. The function `fmap` applies `f` to a type `a` and a type `b`, which are concrete types in absence of any other indication. As previously said, Such kind of objects are similar to the `List`, `Maybe` (`Option` in Scala, and `Optional` in Java), `Set` type constructors. 

What if we want to apply such type class to the `Either` type constructor? Both in Haskell and Scala, it is defined as `Either[L, R]`, defining two type parameters, respectively _left_ and _right_. For the definition we gave of a kind, `Either` has kind `* -> * -> *`. The kind of `Either` and of the type parameter requested by the `Functor` class are not compatible, so we need to _partially apply_ `Either` type, to obtain a new type having kind `* -> *`.

For sake of completeness (and for those of you that know Haskell syntax), the partial application to make `Either` a member of `Functor` results in something like the following. Here, we mapped the case of the _right_ type parameter.

{% highlight haskell %}
instance Functor (Either a) where  
    fmap f (Right x) = Right (f x)  
    fmap f (Left x) = Left x  
{% endhighlight %}

In conclusion, Kinds let us know how to use type classes, and type constructors, to obtain concrete type, sharing their behaviour.

## Conclusions

Our journey through an edulcorated extract of type theory has finished. We saw many different concepts along the way. Many of these should be more detailed, but a post would not have been enough. We should have understood that we need kinds only when we have to manage Higher Kinded Types in Scala or Haskell (or in any programming language that provides a version of such types). 

Kinds help you to understand which type can be a member of a type class. Long story short :)

Sorry for the long, and boring post. Here there is a _lambda potato_.

![My sweet lambda-potato](/assets/2019-02-18/lambda-potato.jpg)

## References

- [Scala: Types of a higher kind](https://www.atlassian.com/blog/archives/scala-types-of-a-higher-kind)
- [Making Our Own Types and Typeclasses](http://learnyouahaskell.com/making-our-own-types-and-typeclasses#the-functor-typeclass)
- [Functors, Applicative Functors and Monoids](http://learnyouahaskell.com/functors-applicative-functors-and-monoids)
- [Kind (type theory)](https://en.wikipedia.org/wiki/Kind_(type_theory))
- [Correct terminology in type theory: types, type constructors, kinds/sorts and values](https://softwareengineering.stackexchange.com/questions/255878/correct-terminology-in-type-theory-types-type-constructors-kinds-sorts-and-va)
- [Type classes in Scala](https://blog.scalac.io/2017/04/19/typeclasses-in-scala.html)
- [Can type constructors be considered as types in functional programming languages?](https://stackoverflow.com/questions/54620961/can-type-constructors-be-considered-as-types-in-functional-programming-languages)
