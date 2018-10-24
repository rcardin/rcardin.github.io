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

First of all, we need a program with some state to mutate during its execution. As an example, let's model a simple representation of a Bank account. Basically, a Bank account contains two main information, that are the client identifier and the available amount.

{% highlight scala %}
case class BankAccount(clientId: String, amount: Double)
{% endhighlight %}

In our representation of reality, a client can perform two operations on her Bank account: a money withdrawal or a money deposit. As we know that in functional programming object are immutable, the two functions cannot have any _side effect_ on their input. So, both functions must return also the updated bank account.

{% highlight scala %}
// Returns the withdrawn amount and an update copy of input account object
def withdraw(account: BankAccount, amount: Double): (Double, BankAccount)
// Returns an update copy of input account object
def deposit(account: BankAccount, amount: Double): BankAccount
{% endhighlight %}

If someone tries to withdraw an amount that is greater than the actual bank account balance, the method `withdraw` will return the available amount and an empty compy of bank account.

## The problem
Now that we defined our basic functions, we want to create another function that composes the following steps:

 1. Create a bank account with 0 Euro
 2. Deposit 100 Euro
 3. Withdraw 50 Euro
 4. Withdraw 30 Euro

Using nothing more that the functions `withdraw` and `deposit`, we can develop the new function as follows.

{% highlight scala %}
def someFancyOperationsOnBankAccount() {
  val bankAccount = BankAccount("rcardin", 0.0D)
  val bankAccount1 = deposit(bankAccount, 100.0D)
  val (bankAccount2, amount) = withdraw(bankAccount1, 50.0D)
  val (bankAccount3, amount1) = withdraw(bankAccount2, 30.0D)
}
{% endhighlight %}

Despite of the simplicity of the above code, you will have certainly noticed that we have to pass *manually* the correct reference to the updated bank account to every step of our algorithm. This is very tedious and error prone.

We need a mechanisms to compose in a smarter way functions that deal with the status of an application. The best would be not to have to worry at all about passing the status of our application from one function call to another.

The State Monad helps us in this way.