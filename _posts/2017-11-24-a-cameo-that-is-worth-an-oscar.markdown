---
layout: post
title:  "A Cameo that is worth an Oscar"
date:   2017-11-24 07:45:21
comments: true
categories: akka scala design-pattern
tags:
    - design pattern
    - akka
    - scala
summary: "Rarely, during my life as a developer, I found pre-packaged solutions that fit my problem so well. Design patterns are an abstraction of both problems and solutions. So, they often need some kind of customization on the specific problem. While I was developing my concrete instance of Actorbase specification, I came across the Cameo pattern. It enlighted my way and my vision about how to use Actors profitably. Let's see how and why."
social-share: true
social-title: "A Cameo that is worth an Oscar"
social-tags: "Akka, Scala, designpatterns"
math: false
reddit-link: "https://www.reddit.com/r/scala/comments/7f7boo/a_cameo_that_is_worth_an_oscar/"
dev-link: "https://dev.to/riccardo_cardin/a-cameo-that-is-worth-an-oscar-944"
dzone-link: "https://dzone.com/articles/a-cameo-that-is-worth-an-oscar"
---

Rarely, during my life as a developer, I found pre-packaged solutions that fit my problem so well. Design patterns are an abstraction of both problems and solutions. So, they often need some kind of customization on the specific problem. While I was developing my concrete instance of [Actorbase specification](http://rcardin.github.io/database/actor-model/reactive/akka/scala/2016/02/07/actorbase-or-the-persistence-chaos.html), I came across the **Cameo pattern**. It enlighted my way and my vision about how to use Actors profitably. Let's see how and why.

## The problem: capturing context
Jamie Allen, in his short but worthwhile book [Effective Akka](http://shop.oreilly.com/product/0636920028789.do), begins the chapter dedicated to Actors patterns with the following words:

> One of the most difficult tasks in asynchronous programming is trying to capture context so that the state of the world at the time the task was started can be accurately represented at the time the task finishes.

This is exactly the problem we are going to try to resolve. 

Actors often model long-lived asynchronous processes, in which a response in the future corresponds to one or more messages sent earlier. Meanwhile, the context of execution of the Actor could be changed. In the case of an Actor, its context is represented by all the mutable variables owned by the Actor itself. A notable example is the `sender` variable that stores the sender of the current message being processed by an Actor.

### Context handling in Actorbase actors

Let's make a concrete example. In Actorbase there are two types of Actors among the others: `StoreFinder` and `Storekeeper`. Each Actor of type `StoreFinder` represents a _distributed map_ or a _collection_, but it does not physically store the key-value couples. This information is stored by `Storekeeper` Actors. So, each `StoreFinder` owns a distributed set of its key-value couples, which means that owns a set of `Storekeeper` Actors that stores the information for it.

`StoreFinder` can route to its `Storekeeper` many types of messages, which represent CRUD operations on the data stored. The problem here is that if a `StoreFinder` owns _n_ `Storekeeper`, to _find_ which value corresponds to a _key_ (if any), it has to send _n_ messages of type `Get("key")` to each `Storekeeper`. Once all the `Storekeeper` answer to the query messages, the `StoreFinder` can answer to its caller with the requested _value_. 

The sequence diagram below depicts exactly the above scenario.

![StoreFinder with two Storekeeper scenario](/assets/2017-11-16/sequence_diagram_sf_sk.png)

The number of answers of `Storekeeper` Actors and the body of their responses represent the execution context of `StoreFinder` Actor.

## Actor's context handling
So, we need to identify a concrete method to handle the execution context of an Actor. The problem is that between the sending of a message and the time when the relative response is received, an Actor processes many other messages.

### Naive solution
Using nothing that my ignorance, the first solution I depicted in Actorbase was the following.

{% highlight scala %}

class StoreFinder(val name: String) extends Actor {
  def receive: Receive = nonEmptyTable(StoreFinderState(Map()))  
  def nonEmptyTable(state: StoreFinderState): Receive = {
    // Query messages from externl actors
    case Query(key, u) =>
      // Route a Get message to each Storekeeper
      broadcastRouter.route(Get(key, u), self)
      context.become(nonEmptyTable(state.addQuery(key, u, sender())))
    // Some other stuff...
    // Responses from Storekeeper
    case res: Item =>
      context.become(nonEmptyTable(state.copy(queries = item(res, state.queries))))   
  }
  // Handling a response from a Storekeeper. Have they all answer? Is there at least
  // a Storekeeper that answer with a value? How can a StoreFinder store the original 
  // sender?
  private def item(response: Item,
                   queries: Map[Long, QueryReq]): Map[Long, QueryReq] = {
    val   Item(key, opt, id) = response
    val QueryReq(actor, responses) = queries(id)
    val newResponses = opt :: responses
    if (newResponses.length == NumberOfPartitions) {
      // Some code to create the message
      actor ! QueryAck(key, item, id)
      queries - id
    } else {
      queries + (id -> QueryReq(actor, newResponses))
    }
  }
}
// I need a class to maintain the execution context
case class StoreFinderState(queries: Map[Long, QueryReq]) {
  def addQuery(key: String, id: Long, sender: ActorRef): StoreFinderState = {
    // Such a complex data structure!
    copy(queries = queries + (id -> QueryReq(sender, List[Option[(Array[Byte], Long)]]())))
  }
  // Similar code for other CRUD operations
}
sealed case class QueryReq(sender: ActorRef, responses: List[Option[(Array[Byte], Long)]])
{% endhighlight %}

A lot of code to handle only a bunch of messages, isn't it? As you can see, to handle the execution context I defined a dedicated class, `StoreFinderState`. For each `Query` message identified by a _UUID_ of type `Long`, this class stores the following information: 
 
 - The original sender
 - The list of responses from `Storekeeper` Actors for the message
 - The values the `Storekeeper` answered with

As you can imagine, the handling process of this context is not simple, as a single `StoreFinder` has to handle all the messages that have not received a final response from all the relative `Storekeeper`.

We can do much better, trust me.

![One does not simply...](https://i.imgflip.com/1zweev.jpg)

### Asking the future
A first attempt to reach a more elegant and concise solution might be the use of the _Ask pattern_ with `Future`.

> This is a great way to design your actors in that they will not block waiting for responses, allowing them to handle more messages concurrently and increase your application’s performance.

Using the Ask pattern, the code that handles the `Query` message and its responses will reduce to the following.

{% highlight scala %}
case Query(key, u) =>
  val futureQueryAck: Future[QueryAck] = for {
    responses <- Future.sequence(routees map (ask(_, Get(key, u))).mapTo[Item])
  } yield {
    QueryAck(/* Some code to create the QueryAck message from responses */)
  }
  futureQueryAck map (sender ! _)
{% endhighlight %}

Whoah! This code is fairly concise with respect to the previous one. In addition, using `Future` and a syntax that is fairly declarative, we can achieve quite easily the right grade of asynchronous execution that we need.

> However, there are a couple of things about it that are not ideal. First of all, it is using futures to ask other actors for responses, which creates a new `PromiseActorRef` for every message sent behind the scenes. This is a waste of resources.

Annoying.

> Furthermore, there is a glaring race condition in this code—can you see it? We’re referencing the “sender” in our map operation on the result from `futureQueryAck`, which may not be the same `ActorRef` when the future completes, because the `StoreFinder` ActorRef may now be handling another message from a different sender at that point!

Even more annoying!

### The Extra pattern
The problem here is that we are attempting to take the result of the off-thread operations of retrieving data from multiple sources and return it to whoever sent the original request to the `StoreFinder`. But, the actor will likely have move on to handling additional messages in its mailbox by the time the above futures complete.

The trick is capturing the execution context of a request in a dedicated inner actor. Let's see how our code will become.

{% highlight scala %}
case Query(key, u) => {
  // Capturing the original sender
  val originalSender = sender
  // Handling the execution in a dedicated actor
  context.actorOf(Props(new Actor() {

    // The list of responses from Storekeepers
    var responses: List[Option[(Array[Byte], Long)]] = Nil
    
    def receive = {
      case Item(key, opt, u) =>
        responses = opt :: responses
        if (responses.length == partitions) {
          // Some code that creates the QueryAck message
          originalSender ! QueryAck(key, item, u)
          context.stop(self)
        }
    }
  }))
}
{% endhighlight %}

Much better. We have captured the context for a single request to `StoreFinder` as the context of a dedicated actor. The original sender of `StoreFinder` Actor was captured by the constant `originalSender` and shared with the anonymous Actor using a _closure_.

It's easy, isn't it? This simple trick is known as the _Extra pattern_. However, we are searching for a _Cameo_ in our movie.

### Finally presenting the Cameo pattern
The Extra pattern is very useful when the code inside the anonymous Actor is very small and trivial. Otherwise, it pollutes the main Actor with details that do not belong to its responsibility (one for all, Actor creation).

> It is also similar to lambdas, in that using an anonymous instance gives you less information in stack traces on the JVM, is harder to use with a debugging tool, and is easier to close over state.

Luckily, the solution is quite easy. We can move the anonymous implementation of the Actor into its own type definition. 

> This results in a type only used for simple interactions between actors, similar to a cameo role in the movies.

Doing so, the code finally becomes the following.

{% highlight scala %}
class StoreFinder(val name: String) extends Actor {
  override def receive: Receive = {
    // Omissis...
    case Query(key, u) =>
      val originalSender = sender()
      val handler = context.actorOf(Props(new QueryResponseHandler(originalSender, NumberOfPartitions)))
      broadcastRouter.route(Get(key, u), handler)
  }
  // Omissis...
}

// The actor playing the Cameo role
class QueryResponseHandler(originalSender: ActorRef, partitions: Int) {

  var responses: List[Option[(Array[Byte], Long)]] = Nil

  override def receive: Receive = LoggingReceive {
    case Item(key, opt, u) =>
      responses = opt :: responses
      if (responses.length == partitions) {
        // Some code to make up a QueryAck message
        originalSender ! QueryAck(key, item, u)
        context.stop(self)
      }
  }
}
{% endhighlight %}

Much cleaner, such satisfying.

![The moment when you succeed in using the Cameo pattern](https://i.imgflip.com/1zv67w.jpg)

Notice that the router in the `StoreFinder` tells the routees to answer to the actor that handles the query messages, `broadcastRouter.route(Get(key, u), handler)`. Moreover, remember to capture the `sender` in a local variable in the main actor, before passing its reference to the inner actor. 

> Make certain you follow that pattern, since passing the sender `ActorRef` without first capturing it will expose your handler to the same problem that we saw earlier where the sender `ActorRef` changed.

## Conclusions
So far so good. We started stating that context handling is not so trivial when we speak about Akka Actors. I showed you my first solution to such problem in Actorbase, the database based on the Actor model I am developing. We agreed that we do not like it. So, we moved on and we tried to use `Future`s. The solution was elegant but suffered from race conditions. In the path through the final solution, we met the _Extra pattern_, which solved the original problem without any potential drawback. The only problem is that this solution was no clean enough. Finally, we approached the Cameo pattern, and it shined in all its beauty. _Simple_, _clean_, _elegant_. 

![I don't always handle context...](https://i.imgflip.com/1zwdxs.jpg)

P.S.: All the code relative to Actorbase can be found on my [GitHub](https://github.com/rcardin/actorbase).

## References
- [Chapter 2: Patterns of Actor Usage, The Cameo Pattern. Effective Akka, Patterns and Best Practices,	Jamie Allen, August 2013, O'Reilly Media](http://shop.oreilly.com/product/0636920028789.do)
- [Re: [akka-user] akka.pattern.ask on a BroadcastRouter](https://groups.google.com/forum/#!topic/akka-user/-3Se23E4lEM)
