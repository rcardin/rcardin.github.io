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

We do not want to complicate things too much. So, we will ignore the case in which someone tries to withdraw an amount that is greater than the actual capacity of the bank account.