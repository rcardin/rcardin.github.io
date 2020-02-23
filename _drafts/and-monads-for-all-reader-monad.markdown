---
layout: post
title:  "...And Monads for (Almost) All: The Reader Monad"
date:   2020-02-25 21:09:53
comments: true
categories: design programming fp monad
tags:
    - design
    - programming
    - fp
summary: "I have already written of dependency injection mechanisms in modern programming languages. I wrote about the Cake Pattern and how to use Scala self types to resolve the problem of dependency injection. Then, I showed how to use Scala implicits to implement a dependency injection mechanism. Now its time to speak about how functional programming tries to solve the depenency management issue, using the Reader Monad."
social-share: true
social-title: "...And Monads for (Almost) All: The Reader Monad"
social-tags: "FP, design, Programming, monad, Scala, Kotlin"
math: false
---

Who follows me from the beginning perfectly knows my obsession for the dependency management in programming languages. I have already written of dependency injection mechanisms in modern programming languages. In [Eat that cake!](http://rcardin.github.io/design/2014/08/28/eat-that-cake.html) I wrote about the Cake Pattern and how to use Scala self types to resolve the problem of dependency injection. In [Resolving your problems with Dependency Injection](http://rcardin.github.io/programming/software-design/java/scala/di/2016/08/01/resolve-problems-dependency-injection.html) I introduced the problem of the dependency resolution. In [Resolve me, Implicitly](http://rcardin.github.io/design/scala/2017/10/15/resolve-me-implicitly.html) I showed how to use Scala `implicit`s to implement a dependency injection mechanism. Now its time to speak about how functional programming tries to solve the depenency management issue, using the *Reader Monad*.

## The problem

Imagine you have a type whose responsibility is to manage persistence of _stocks_ information. Let we call it `StockRepository`. The repository can retrieve all the stocks present in a wallet, can sell a quantity of a stock or can buy some amount of a stock. It follows the definition of such type.

{% highlight scala %}
trait StockRepository {
  def findAll(): Map[String, Double]
  def sell(stock: String, quantity: Double): Double
  def buy(stock: String, amount: Double): Double
}
{% endhighlight %}

The repository implements what we can call _persistence logic_.

Then, we have a type that uses the `StockRepository` to give to its clients some _business logic_ built upon the above _persistence logic_. Let's call it `Stocks`. Imagine that we want to give access to the three functions of the repository, plus a fourth function that invest money in the stock that has the lowest quotation.

1) `findAll()`
2) `sell(stock: String, quantity: Double)`
3) `buy(stock: String, amount: Double)`
4) `investInStockWithMinValue(amount: Double)`

So, `Stocks` has a dependency upon `StockRepository`. How can we express such fact in the code? We don't want to use the _constructor injection_ mechanism or anything related to it. We want to stay _functional_.

## Dependency management within functions

### The trivial solution

An option is to pass a reference of the repository to each function that need to access to its methods.

{% highlight scala %}
object Stocks {
  def findAll(repo: StockRepository): Map[String, Double] = repo.findAll()
  def sell(stock: String, quantity: Double, repo: StockRepository): Double = 
    repo.sell(stock, quantity)
  def buy(stock: String, amount: Double, repo: StockRepository): Double = 
    repo.buy(stock, amount)
}
{% endhighlight %}

This trick does its dirty work but it pollutes the signature of each function that need some external dependency. Our example has only one dependency but in real life programs dependency are often more than one.

### Using currying to isolate dependencies

The _currying_ process can help us to make things a little better. Imagine to isolate the dependency parameters using a curried verions of the previous functions.

{% highlight scala %}
object Stocks {
  def findAll()(repo: StockRepository): Map[String, Double] = repo.findAll()
  def sell(stock: String, quantity: Double)(repo: StockRepository): Double = 
    repo.sell(stock, quantity)
  def buy(stock: String, amount: Double)(repo: StockRepository): Double = 
    repo.buy(stock, amount)
}
{% endhighlight %}

As you know, the currying process allows us to _partially applied_ a function, obtaining as the result of the partial application a new function with less inputs. 

> In mathematics and computer science, currying is the technique of translating the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, each with a single argument.

Let's take an example.

Let the function `def add(a: Int, b: Int): Int = a + b` that adds to integers. If we apply currying to the function `add` we obtain the following new function.

% highlight scala %}
`def add(a: Int) = (b: Int) =>  a + b`
{% endhighlight %}

The return type of the function `add` is not anymore a simple `Int` but now it is a function from `Int => Int`.

If we apply the currying reasoning to the functions of the `Stocks` module, we obtain the following definition.

{% highlight scala %}
object Stocks {
  def findAll(): (StockRepository) => Map[String, Double] = repo => repo.findAll()
  def sell(stock: String, quantity: Double): (StockRepository) => Double = 
    repo => repo.sell(stock, quantity)
  def buy(stock: String, amount: Double): (StockRepository) => Double = 
    repo => repo.buy(stock, amount)
}
{% endhighlight %}

We remove the ugly `StockRepository` parameter from the signature of our function! Yuppi yuppi ya! However, it is very difficult to compose functions with the last signature we had :(
