---
layout: post
title:  "...And Monads for (Almost) All: The State Monad"
date:   2018-11-22 21:09:53
comments: true
categories: design programming fp monad
tags:
    - design
    - programming
    - fp
summary: "This article starts a series on a topic that is very hot among the developers' community: functional programming. In details, we will focus on monads. The main aim of monads is to make simpler the composition of pure functions, that are mathematical functions that cannot have any side effect. We start with a classic: The State Monad. As its name suggests, using this object, we will be able to manage the state of a program effectively, without breaking one of the main principles of the paradigm, immutability."
social-share: true
social-title: "...And Monads for (Almost) All: The State Monad"
social-tags: "FP, design, Programming, monad, Scala"
reddit-link: "https://www.reddit.com/r/programming/comments/9zna03/and_monads_for_all_the_state_monad/"
math: false
---

This article starts a series on a topic that is very hot among the developers' community: functional programming. In details, we will focus on _monads_. This very complex object coming from the Category Theory is so important in functional programming that is very hard to program without it in this kind of paradigm. Its main aim is to make simpler the composition of pure functions, that are mathematical functions that cannot have any _side effect_. We start with a classic: _The State Monad_. As its name suggests, using this object, we will be able to manage the state of a program effectively, without breaking one of the main principles of the paradigm , _immutability_.

**Disclaimer**: I will not describe the very basics of functional programmings, such as immutability and referential transparency. The material I present has the primary objective to fix the concepts and the reasoning that are needed to understand the basic Monads. 

I will use Scala, because I don't know Haskell (but, it is in my todo list) and because it is a language I love (coming from Java ecosystem). You can agree, or in disagreement with me. I don't mind ;)

## The context

First of all, we need a program with some state to mutate during its execution. As an example, let's model a simple representation of a stock portfolio. A stock portfolio is a map that associate stock's names to some stocks owned.

{% highlight scala %}
type Stocks = Map[String, Double]
{% endhighlight %}

In our representation of reality, a client can perform three operations on her stock portfolio: To buy more stocks; To sell owned stocks; To get the number of stocks owned. As we know that in the functional programming object are immutable, the three functions cannot have any _side effect_ on their input. So, all of the functions must also return the updated bank account.

{% highlight scala %}
// Buys an amount (dollars) of the stock with given name. Returns the number
// of purchased stocks.
def buy(name: String, amount: Double, portfolio: Stocks): (Double, Stocks) = {
  val purchased = amount / Prices(name)
  val owned = portfolio(name)
  (purchased, portfolio + (name -> (owned + purchased)))
}
// Sells a quantity of stocks of the given name. Returns the amount of
// dollars earned by the selling operation.
def sell(name: String, quantity: Double, portfolio: Stocks): (Double, Stocks) = {
  val revenue = quantity * Prices(name)
  val owned = portfolio(name)
  (revenue, portfolio + (name -> (owned - quantity)))
}
// Returns the quantity of stocks owned for name.
def get(name: String, portfolio: Stocks): Double = portfolio(name)
{% endhighlight %}

We imagine to live in a colored world, full of funny and unicorns, so our portfolio always contains some stocks for the given name.

## The problem

Now that we defined our essential functions, we want to create another function that composes them to create a new use case:

 1. Selling all the stocks for a given company
 2. Using the sell's revenue, buying stocks of another company
 3. Returning the number of stocks of the first type owned, and the quantity of the newly purchased stocks

Using nothing more than the functions `get`, `sell`, and `buy`, we can develop the new function as follows.

{% highlight scala %}
def move(from: String, to: String, portfolio: Stocks): ((Double, Double), Stocks) = {
    val originallyOwned = get(from)(portfolio)
    val (revenue, newPortfolio) = sell(from, originallyOwned)(portfolio)
    val (purchased, veryNewPortfolio) = buy(to, revenue)(newPortfolio)
    ((originallyOwned, purchased), veryNewPortfolio)
  }
{% endhighlight %}

Despite the simplicity of the above code, you will have undoubtedly noticed that we have to pass *manually* the correct reference to the updated stocks portfolio to every step of our algorithm. This kind of programming is very tedious and **error prone**.

We need a mechanism to compose in a smarter way functions that deal with the status of an application. The best would be not to have to worry at all about passing the status of our application from one function call to another.

> Awkwardness like this is almost always a sign of some missing abstraction waiting to be discovered.

The State Monad helps us in this way.

![Show me the code!](https://i.imgflip.com/2n7wbj.jpg)

## The path through the Monad

Citing the book "[Learn You a Haskell for Great Good!](http://learnyouahaskell.com/)"

> We’ll say that a stateful computation is a function that takes some state and returns a value along with some new state.

Our `buy` and `sell` functions already behave in this sense. They return both a value and a new instance of state. However, the function `get` returns only a value, without updating the state. No problem. It is easy to change its definition to let the function return a value and a state: Use the same input state. So the definition of the function `get` changes into the following.

{% highlight scala %}
def get(name: String, portfolio: Stocks): (Double, Stocks) = (portfolio(name), portfolio)
{% endhighlight %}

The type of the stateful computation quoted above is `S => (A, S)`, where `S` is the state and `A` is the value resulting from the execution of the function. The functions of this type are called _state actions_ of _state transitions_. Hence, we can rewrite the `buy`, `sell`, and `get` functions as follows.

First of all, let's use some _currying_ to divide inputs into two groups, and to isolate the state.

{% highlight scala %}
def buy(name: String, amount: Double)(portfolio: Stocks): (Double, Stocks)
def sell(name: String, quantity: Double)(portfolio: Stocks): (Double, Stocks)
def get(name: String)(portfolio: Stocks): (Double, Stocks)
{% endhighlight %}

If we pass to these functions only the first group of inputs, we obtain precisely a set of functions of type `S => (A, S)`.

{% highlight scala %}
def buyPartial(name: String, amount: Double): Stocks => (Double, Stocks) = 
  buy(name, amount)
// And so on...
{% endhighlight %}

The next step is to remove the currying at all. It is not elegant, and we don't like its syntax ;)

{% highlight scala %}
def buy(name: String, amount: Double): Stocks => (Double, Stocks) = portfolio => {
  val purchased = amount / Prices(name)
  val owned = portfolio(name)
  (purchased, portfolio + (name -> (owned + purchased)))
}
// And so on...
{% endhighlight %}

Just to improve the readability of our three functions, let's define the following _type alias_.

{% highlight scala %}
type Transaction[+A] = Stocks => (A, Stocks)
{% endhighlight %}

Our three functions always return a `Double` as output. However, to be more elastic, we need the type parameter `A` to let a function on `Stocks` type to returns any value.

With the new type alias, our functions become the following.

{% highlight scala %}
def buy(name: String, amount: Double): Transaction[Double] = portfolio => {
  val purchased = amount / Prices(name)
  val owned = portfolio(name)
  (purchased, portfolio + (name -> (owned + purchased)))
}
def sell(name: String, quantity: Double): Transaction[Double] = portfolio => {
  val revenue = quantity * Prices(name)
  val owned = portfolio(name)
  (revenue, portfolio + (name -> (owned - quantity)))
}
def get(name: String): Transaction[Double] = portfolio => {
  (portfolio(name), portfolio)
}

// And finally...
def move(from: String, to: String): Transaction[(Double, Double)] = portfolio => {
  val (originallyOwned, _) = get(from)(portfolio)
  val (revenue, newPortfolio) = sell(from, originallyOwned)(portfolio)
  val (purchased, veryNewPortfolio) = buy(to, revenue)(newPortfolio)
  ((originallyOwned, purchased), veryNewPortfolio)
}
{% endhighlight %}

Well, the situation has improved for nothing. What we need now is a better way to compose our functions that we can obtain making the last step through the definition of the State monad: The definition of `map` and `flatMap` functions.

![Do we have some improvements?](https://i.imgflip.com/2n7wt5.jpg)

## The final step: combinator functions

> Well the power of programming is composition, the ability to combine different operations to obtain our target result.

The final step we need to do to build our version of the State monad is to define a set of functions that let us combine states smartly, i.e. `Transaction[+A]` instances.

The first function we need is `map`. As you may already know, the `map` function allows applying a function to the type contained in a generic data structure, obtaining a new version of it.

In our case, the `map` function is used to transform a `Transaction[A]` in a `Transaction[B]`.

{% highlight scala %}
def map[A, B](tr: Transaction[A])(f: A => B): Transaction[B] = portfolio =>
  (a, newPortfolio) = tr(portfolio)
  (f(a), newPortfolio)
{% endhighlight %}

However, the problem with the `map` function is that it tends to accumulate the generic type. For example, the result of the repeated application of `map` to a `Transaction[_]`, `map(/*... */)(a => map(/*...*/)(/*...*/)` is `Transaction[Transaction[_]]`. So, we need a function that behaves like `map`, but that can _flatten_ the accumulated types: The `flatMap` function. Instead of taking a function from `A` to `B` as a parameter, the `flatMap` function takes a function from `A` to `Transaction[B]` as a parameter. 

Remembering the `type Transaction[+A] = Stocks => (A, Stocks)`, the `flatMap` function is defined indeed in this way.

{% highlight scala %}
def flatMap[A,B](tr: Transaction[A])(f: A => Transaction[B]): Transaction[B] = portfolio =>
  (a, newPortfolio) = tr(portfolio)
  f(a)(newPortfolio)
{% endhighlight %}

Very well. The last step we miss is to define a function that _lifts_ a value of type `A` to the type `Transaction[A]`. Think about this function as a factory method in Object-Oriented Programming.

{% highlight scala %}
def apply[A](value: A): Transaction[A] = portfolio => (A, portfolio)
{% endhighlight %}

Using the _combinators_ we just defined, we can rewrite the `move` method more cleanly.

{% highlight scala %}
def move(from: String, to: String): Transaction[(Double, Double)] =
  flatMap(get(from))(
    originallyOwned => flatMap(sell(from, originallyOwned))(
      revenue => map(buy(to, revenue))(
        purchased => (originallyOwned, purchased)
      )
    )
  )
{% endhighlight %}

The presence of the `map` and the `flatMap` functions allows us to improve further the readability of the code of the `move` function, just applying the syntactic sugar of the _for-comprehension_ construct. With the `for...yield` syntax, the function becomes the following.

{% highlight scala %}
def move(from: String, to: String): Transaction[(Double, Double)] =
  for {
    originallyOwned <- get(from)
    revenue <- sell(from, originallyOwned)
    purchased <- buy(to, revenue)
  } yield {
    (originallyOwned, purchased)
  }
{% endhighlight %}

Wow! Now, the code looks like the good imperative code, but it maintains all the remarkable feature of functional code. _Supercalifragilisticexpialidocious!!!_

## Summing up

It's time to abstract the above concepts into our monad construct. First of all, we need a type for our monad. Our stocks example uses the type `Stocks` to store the state of the application. We need to substitute it with a generic type variable, `S`. `Transaction[A]` abstracts to type `State[S, A]`.

{% highlight scala %}
type State[S, A] = S => (A, S)
// And so...
type Transaction[A] = State[Stocks, A]
{% endhighlight %}

Once we defined the `State[S, A]` type, the `unit`, `map`, and `flatMap` functions becomes the following.

{% highlight scala %}
def unit[S, A](a: A): State[S, A] = state => {
  (a, state)
}
def map[S, A, B](sm: State[S, A])(f: A => B): State[S, B] = state => {
  val (value, newState) = sm(state)
  (f(value), newState)
}
def flatMap[S, A, B](sm: State[S, A])(f: A => State[S, B]): State[S, B] = state => {
  val (value, newState) = sm(state)
  f(value)(newState)
}
{% endhighlight %}

So, this is our State Monad! Awesome! Moreover, the definition of type `Transaction` regarding the type `State` allows us to maintain the code of our business function as it is. No change is needed.

If you prefer, you can define a `trait` for the type `State`. If so, the functions `unit`, `map`, and `flatMap` become methods of the trait, instead of lonely functions.

![Welcome to the state monad](https://i.imgflip.com/2n7xa4.jpg)

### Reinventing the wheel

There are a lot of good functional libraries out of there for the Scala language. Both [Scalaz](http://eed3si9n.com/learning-scalaz/State.html) and [Cats](https://typelevel.org/cats/datatypes/state.html) have their implementation of the State Monad. So, the above is only an exercise to acquire a deeper understanding of the State Monad concepts, but it is not ready for production use ;)

## Conclusions
In our journey, we started from an application that needs to share some state. Many functions modify this state. Following the functional programming constraints, we tried to avoid the use of mutable state. Using curryfication and first-order functions, we built a framework that allowed us to share the state between different functions. Then, we introduced some _combinators_, to make the process of composing the previous functions in a more natural, and less error-prone way. 

Our final gratification was the definition of the State Monad.

The code I used in this post is available in my GitHub repository, [state-monad-example](https://github.com/rcardin/state-monad-example)

## References

- [Chapter 6: Purely functional state. Functional Programming in Scala, P. Chiusano,  R. Bjarnason, 2014, Manning Publications](https://www.manning.com/books/functional-programming-in-scala)
- [Demistify the State Monad with Scala 1/2](http://patricknoir.blogspot.com/2014/12/demistify-state-monad-with-scala-12.html)
- [Learning Scalaz — Tasteful stateful computations](http://eed3si9n.com/learning-scalaz/State.html)