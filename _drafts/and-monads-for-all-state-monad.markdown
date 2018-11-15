---
layout: post
title:  "...And Monads for All: The State Monad"
date:   2018-11-03 17:15:53
comments: true
categories: design programming fp monad
tags:
    - design
    - programming
    - fp
summary: "This article starts a series on a topic that is very hot among the developers' community: functional programming. In details, we will focus on monads. The main aim of monads is to make simplier the composition of pure functions, that are mathematical functions that cannot have any side effect. We start with a classic: The State Monad. As its name suggests, using this object, we will be able to manage effectively the state of a program, without breaking one of the paradigm main principles, immutability."
social-share: true
social-title: "...And Monads for All: The State Monad"
social-tags: "FP, design, Programming, monad"
math: false
---

This article starts a series on a topic that is very hot among the developers' community: functional programming. In details, we will focus on _monads_. This very complex object coming from the Category Theory is so important in functional programming that is very hard to program without it in this king of paradigm. Its main aim is to make simplier the composition of pure functions, that are mathematical functions that cannot have any _side effect_. We start with a classic: _The State Monad_. As its name suggests, using this object, we will be able to manage effectively the state of a program, without breaking one of the paradigm main principles, _immutability_.

## The context

First of all, we need a program with some state to mutate during its execution. As an example, let's model a simple representation of a stock portfolio. Basically, a stock portfolio is a map that associate stock's names to an amount of stocks owned .

{% highlight scala %}
type Stocks = Map[String, Double]
{% endhighlight %}

In our representation of reality, a client can perform three operations on her stock porfolio: To buy more stocks; To sell owned stocks; Get the quantity of stocks owned. As we know that in functional programming object are immutable, the three functions cannot have any _side effect_ on their input. So, all of the functions must return also the updated bank account.

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

We imagine to live in a colored world, full of funny and unicorns, so our portfolio contains always some stocks for the given name.

## The problem

Now that we defined our basic functions, we want to create another function that composes the following steps:

 1. To sell all the stocks for a given company
 2. Using the sell's revenue, to buy stocks of another company
 3. To return the quantity of stocks of the first type initially owned, and the quantity of the new purchased stocks

Using nothing more that the functions `get`, `sell`, and `buy`, we can develop the new function as follows.

{% highlight scala %}
def move(from: String, to: String, portfolio: Stocks): ((Double, Double), Stocks) = {
    val (originallyOwned, _) = get(from)(portfolio)
    val (revenue, newPortfolio) = sell(from, originallyOwned)(portfolio)
    val (purchased, veryNewPortfolio) = buy(to, revenue)(newPortfolio)
    ((originallyOwned, purchased), veryNewPortfolio)
  }
{% endhighlight %}

Despite of the simplicity of the above code, you will have certainly noticed that we have to pass *manually* the correct reference to the updated stocks portfolio to every step of our algorithm. This is very tedious and **error prone**.

We need a mechanisms to compose in a smarter way functions that deal with the status of an application. The best would be not to have to worry at all about passing the status of our application from one function call to another.

> Awkwardness like this is almost always a sign of some missing abstraction waiting to be discovered.

The State Monad helps us in this way.

## The path through the Monad

Citing the book "[Learn You a Haskell for Great Good!](http://learnyouahaskell.com/)"

> We’ll say that a stateful computation is a function that takes some state and returns a value along with some new state.

Our `withdraw` function already behaves in this sense. It returns both a value and a new instance of state. However, the function `deposit` returns only an updated state. No problem. It is easy to change its definition to let the function return a value and a state: Just use an empty value. In Scala, we can use the `Unit` type, and so the definition of the function `deposit` changes into the following.

{% highlight scala %}
def deposit(account: BankAccount, amount: Double): (Unit, BankAccount)
{% endhighlight %}

The type of the stateful computation quoted above is `s -> (a, s)`, where `s` is the state and `a` is the value resulting from the execution of the function. Functions of this type are called _state actions_ of _state transitions_.Hence, we can rewrite the `withdraw` and `deposit` functions as follows.

{% highlight scala %}
def deposit(amount: Double): BankAccount => (Unit, BankAccount)
def withdraw(amount: Double): BankAccount => (Double, BankAccount)
{% endhighlight %}

Just to improve the readability of our two functions, let's define the following _type alias_.

{% highlight scala %}
type Transfer[+A] = BankAccount => (A, BankAccount)
{% endhighlight %}

We need the type parameter `A` because our function returns both a `Unit` and a `Double` value.

Using the new type alias, our functions become the following.

{% highlight scala %}
def deposit(amount: Double) = account => ((), account.copy(balance = account.balance + amount)
def withdraw(amount: Double) = account => {
  if (amount > account.balance)
    (account.balance, account.copy(balance = 0))
  else
    (amount, account.copy(balance = account.balance - amount))
}

// And finally...
def someFancyOperationsOnBankAccount() {
  val bankAccount = BankAccount("rcardin", 0.0D)
  val bankAccount1 = deposit(100.0D)(bankAccount)
  val (bankAccount2, amount) = withdraw(50.0D)(bankAccount1)
  val (bankAccount3, amount1) = withdraw(30.D)(bankAccount2)
}
{% endhighlight %}

Well, the situation has not improved for nothing. What we really need now is a better way to compose our functions that we can obtain making the last step throught the definition of the State monad: The definition of `map` and `flatMap` functions.

## The final step: combinator functions

> Well the power of programming is composition, the ability to combine different operations together in order to obtain our target result.

The final step we need to do to build our version of the State monad is to define a set of functions that let us combine smartly states, i.e. `Transfer[+A]` instances.

The first function we need is `map`. As you may already know, the `map` function allows to apply a function to the type contained in a generic data structure, obtaining a new version of it.

In our case, the `map` function is used to transform `Transfer[A]` in a `Transfer[B]`.

{% highlight scala %}
def map[A,B](tr: Transfer[A])(f: A => B): Transfer[B] = account =>
  (a, newAccount) = tr(account)
  (f(a), newAccount)
{% endhighlight %}

However, the problem with the `map` function  is that it tends to accumulate the generic type. For example, the result of the repeated application of `map` to a `Transfer[_]`, `transfer.map(/*... */).map(/*...*/)` is `Transfer[Transfer[_]]`. So, we need a function that behaves like `map`, but that can _flatten_ the accumulated types: The `flatMap` function. Instead of taking a function from `A` to `B` as parameter, the `flatMap` function takes a function from `A` to `Transfer[B]` as parameter. 

Remembering the `type Transfer[+A] = BankAccount => (A, BankAccount)`, the `flatMap` function is defined indeed in this way.

{% highlight scala %}
def flatMap[A,B](tr: Transfer[A])(f: A => Transfer[B]): Transfer[B] = account =>
  (a, newAccount) = tr(account)
  f(a)(newAccount)
{% endhighlight %}

Very well. The last step we miss is to define a function that _lifts_ a value of type `A` to the type `Transfer[A]`. Think about this functino as a factory method in Object-Oriented Programming.

{% highlight scala %}
def apply[A](value: A): Transfer[A] = account => (A, account)
{% endhighlight %}

Using the _combinators_ we just defined, we can rewrite the `someFancyOperationsOnBankAccount` method in a cleaner way.

{% highlight scala %}
def someFancyOperationsOnBankAccount() {
  flatMap(deposit(100.D))(() => flatMap(withdraw(50.0D))(amount => map(withdraw(30.0D))))
}
{% endhighlight %}

## References

- [Chapter 6: Purely functional state. Functional Programming in Scala, P. Chiusano,  R. Bjarnason, 2014, Manning Publications](https://www.manning.com/books/functional-programming-in-scala)
- [Demistify the State Monad with Scala 1/2](http://patricknoir.blogspot.com/2014/12/demistify-state-monad-with-scala-12.html)
- [Learning Scalaz — Tasteful stateful computations](http://eed3si9n.com/learning-scalaz/State.html)