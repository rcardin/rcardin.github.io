---
layout: post
title:  "Implementing Time Series in MongoDB"
date:   2017-01-31 12:10:12
comments: true
categories: database mongodb time-series
tags:
    - database
    - mongodb
    - time-series
summary: "I came recently to design a solution for MongoDB to store information that has time as the
          main axis of analysis. This information should be stored in a way that is easy enough to
          query and aggregate using many different time granularity (monthly, weekly, daily, ...). Information
          should also be stored in a way that does not consume too much disk space and is optimal in performance
          for MongoDB to maintain. In a word, I need to transform MongoDB in a Time series database."
social-share: true
social-title: "Implementing Time Series in MongoDB"
social-tags: "database, mongodb"
medium-link: "https://medium.com/@riccardo_cardin/implementing-time-series-in-mongodb-1bd99523f01d#.xuu0js11y"
dzone-link: "https://dzone.com/articles/implementing-time-series-in-mongodb"
dev-link: "https://dev.to/riccardo_cardin/implementing-time-series-in-mongodb"
---

I came recently to design a solution for MongoDB to store information that has time as the
main axis of analysis. This information should be stored in a way that is easy enough to
query and aggregate using many different time granularity (monthly, weekly, daily, ...). Information
should also be stored in a way that does not consume too much disk space and is optimal in performance
for MongoDB to maintain. In a word, I need to transform MongoDB in a Time series database.

#### Time series

Let's start from the beginning. What a *time series* is. Citing [Wikipedia](https://en.wikipedia.org/wiki/Time_series):

> A time series is a series of data points indexed (or listed or graphed) in time order. Most commonly, a time series
  is a sequence taken at successive equally spaced points in time. Thus it is a sequence of discrete-time data.

InfluxDB [Key Concepts page](https://docs.influxdata.com/influxdb/v1.1/concepts/key_concepts/) gives us an example extremely
easy to understand of what a time series is. Imagine you have two scientists that have to record the number of
two type of insects in two different locations. Using a tabular view, we come across something like the following.

{% highlight SQL %}
time                  butterflies  honeybees  location  scientist
------------------------------------------------------------------
2015-08-18T00:00:00Z  12           23         1         langstroth
2015-08-18T00:00:00Z  1            30         1         perpetua
2015-08-18T00:06:00Z  11           28         1         langstroth
2015-08-18T00:06:00Z  3            28         1         perpetua
2015-08-18T05:54:00Z  2            11         2         langstroth
2015-08-18T06:00:00Z  1            10         2         langstroth
2015-08-18T06:06:00Z  8            23         2         perpetua
2015-08-18T06:12:00Z  7            22         2         perpetua
{% endhighlight %}

As you can see, the main dimension of this data mart is **time**. Events stored in it span through time. In this example, What we can refer to as *basic time granularity* is set to minutes. This means that we cannot produce an analysis of these
data that has a granularity less than the basic (minutes).

Columns like `butterflies` and `honeybees` are called *fields*. Fields are made up of field keys and field values. *Field
keys* (i.e. `butterflies` and `honeybees`) are strings and they store *metadata*; the field key `butterflies` tells us that the
field values `12`-`7` refer to butterflies and the field key `honeybees` tells us that the field values `23`-`22` refer
to, well, honeybees.

*Field values* are the data; a field value is always associated with a timestamp in a time series database. The collection
of field-key and field-value pairs makes up a *field set*.

Last, but not least, columns like `location` and `scientist` are called *tags*. Also in this case, a tag is made up of a
*tag key* and a *tag value*. We can look at tags like *indexes*, that help the access to the time series. They are not
mandatory, but they helps a lot.

We have time series, now. But, are these databases only a bunch of tables that forces the presence of a timestamp? No, the
main characteristic of a time series database is that it should have some **powerful tools** to aggregate data (*fields*) over time.
Let's say, if we need to know how much butterflies were counted by scientist "perpetua" in "location 1" during the last year,
it should be easy to retrieve this information.

#### Time series in MongoDB
MongoDB is a general purpose document oriented database. This means that information inside the database is stored as document.
MongoDB uses BSON format, a binary variant of JSON documents. A document in MongoDB looks like the following.

{% highlight javascript %}
{
  _id: "yuebf09e-e0ewrewr-wererwer-324324edd",
  name: "Riccardo",
  surname: "Cardin",
  hobbies: ["computer science", "karate", "bass guitar"]
  //...
}
{% endhighlight %}

Among the types that are available for field values we find *string*, *numbers*, *timestamps*, *arrays*, *documents*, and so on.
How can we design a document schema such that MongoDB can manage time series?

For a number of reasons that will be analyzed later in this document, the best way to treat time series in MongoDB is using a
*subdocument* for each level of aggregation we want to manage. Let's convert the above example about scientists and insects to
MongoDB.

Suppose that you want to maintain minutes as the maximum granularity over time (basic granularity). Then, imagine that you also want to give access to a partially aggregate information in hours, days and months. The final optimal document schema you should use is the following.

{% highlight javascript %}
{
  _id: "1234567890",
  // The document is indexed by month
  date: ISODate("2015-08-01T00:00:00.000Z"),
  // In the main document we fing tags
  location: 1,
  scientist: "langstroth",
  days: [
    // We have a subdocument in the days array for every day in the month
    {
      date: ISODate("2015-08-18T00:00:00.000Z"),
      // In each subdocument we find field keys and values
      butterflies: 23,
      honeybees: 51,
      hours: [
        // We have a subdocument for every hour in a day
        {
          date: ISODate("2015-08-18T00:00:00.000Z"),
          butterflies: 23,
          honeybees: 51,
          minutes: [
            {
              // And finally, we find the minutes granularity. Also here
              // we have a subdocument for each minute in an hour
              date: ISODate("2015-08-18T00:00:00.000Z"),
              butterflies: 12,
              honeybees: 23
            },
            // Omissis...
            {
              date: ISODate("2015-08-18T00:06:00.000Z"),
              butterflies: 11,
              honeybees: 28
            },
            // Omissis...
          ]
        },
        // Omissis...
      ]
    },
    // Omissis...
  ]
}
{% endhighlight %}

Such a big document, isn't it? As you can see the trick here is to have a subdocument level for each granularity we need in
our analysis. Tags are in the main document, let's say at level 0. Fields are partially aggregated at each level (1, 2, ...).
The aggregation over time is determined by the value of the `date` property at each level. Documents are always *complete*.
This means that we will find a subdocument for each minute / hour / day, whether the fields value are 0 or not.

**Why this? Why that?**<br/>
So far so good. Now, the question is: why do we use this complex document schema? Which are the pro and cons?

First of all, if we model our events using an 1:1 approach with respect to the documents we would end up with one document
per event.

{% highlight javascript %}
{
  _id : "1234567890"
  date: ISODate("2015-08-18T00:00:00.000Z"),
  location: 1
  scientist: "langstroth"
  butterflies: 12,
  honeybees: 23
},
{
  _id : "0987654321"
  date: ISODate("2015-08-18T00:06:00.000Z"),
  location: 1
  scientist: "langstroth"
  butterflies: 11,
  honeybees: 28
}
{% endhighlight %}

While this approach is valid in MongoDB, it doesn’t take advantage of the expressive nature of the document model. Moreover,
to aggregate results that span through an interval, MongoDB needs to access to a possibly large number of documents.

Another good question is why we are using arrays to model days, hours and minutes information, instead of using dedicated
JSON property for each element. Arrays works very well with the [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/aggregation/).
In detail, using the [`$unwind`](https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/) operator,
it is possible to flatten the internal structure of each document, turning the querying process into an easy job, also
for information stored in subdocuments.

For example, using the following aggregation pipeline it is possible to easily retrieve the number of butterflies
reported by scientist *langstroth*, in location 1, during the days between 2015-08-18 and 2015-08-20.

{% highlight javascript %}
db.test.aggregate([
    {$match: {location: 1, scientist: 'langstroth'}},
    {$unwind: '$days'},
    {$match: {'$and': [{'days.date': {'$gte' : ISODate("2015-08-18T00:00:00.000Z")}},
                       {'days.date': {'$lte' : ISODate("2015-08-20T00:00:00.000Z")}}]}},
    {$project: {_id : 0, location: 1, scientist: 1, 'butterflies' : '$days.butterflies'}},
    {$group: {_id : {location: '$location', scientist: '$scientist'}, butterflies: {'$sum': '$butterflies'}}}
])
{% endhighlight %}

In the example we are using many levels of subdocuments, i.e. days, hours and minutes. Clearly, all these levels
are not mandatory. However, in this way we can increase update performance when updating the document. MongoDB can
walk faster through an array that contains few elements during the update process.

Another important thing is that the main document must be inserted into the collection in its full form, which means
with all the levels of granularity already filled. At the beginning, all the fields values in each subdocument
will be equal to zero. However, this is an important requirement to take into consideration. In this way, *no update will
cause an existing document to grow or be moved on disk*. This fact allows MongoDB to perform better on the collection.

But, this requirement opens an important issue about the management of time series using MongoDB: who is responsible to
insert the "all zero" document for each *tag set* inside the collection?

#### Which came first, the chicken or the egg?
This is the real and central issue using MongoDB to model time series. We need a procedure that inserts the documents
before we can use and update them.

First attempt: we can develop a process that periodically inserts for us those documents. Nice try, dude. However this
approach is not possible for those use cases in which the *domain of the tags* is not known *a priori*. Returning to
our example, imagine that your system is collecting butterflies and honeybees counted by the scientists of all over the
world. It is impractical to know the name of all these scientists.

Second attempt: try to take some advantage using the [`$setOnInsert`](https://docs.mongodb.com/manual/reference/operator/update/setOnInsert/)
clause in a `$update` (*upsert*) statement. From MongoDB documentation we have:

> If an update operation with upsert: true results in an insert of a document, then $setOnInsert assigns the specified
  values to the fields in the document. If the update operation does not result in an insert, `$setOnInsert` does nothing.

Bingo! We found it! We can insert the whole documents in a `$setOnInsert` clause the first time we try to update the
collection. *Nope*. Due to a bug explained in [this Stackoverflow question](https://stackoverflow.com/questions/41552405/mongodb-collection-update-initialize-a-document-with-default-values)
it not possible use the same property both in the `$setOnInsert` and `$update` clauses. S**t!

#### Three step initialization
Then, do we reach a dead end, a *cul-de-sac*? At first sight it may seem so. Fortunately, me and my colleagues found a
*workaround*. We can call it *three step initialization*. 

Remember that MongoDB guarantees the atomicity of operations on a single document. With this fact in mind we can operate
in the following way:

1. Try to update the document, incrementing properly the counters at a specified time chunk. Do not make an *upsert*, just
   a old-fashioned [update](https://docs.mongodb.com/manual/reference/method/db.collection.update/) operation. Remember
   that the execution of an update statement returns the number of documents written. If the number of documents written
   is greater than zero, you're done.
2. If the number of documents written by the update is zero, then it means that the relative document to update is not
   yet present in the collection. Try to [insert](https://docs.mongodb.com/manual/reference/method/db.collection.insert/)
   the whole document for the specified *tags*. Put all the counters (*field values*) to zero. Also the execution of an
   insert statement returns the number of documents written. If it returns zero or throws an exception, never mind: it
   means that some other process had already insert the document for the same tags.
3. Execute the same above update again.

The code should looks like something similar to the following code snippet. Here we want to add 1 to butterflies and honeybees
*field values* for the date 2015-08-01T00:06:00.000Z, and *tags* location 1 and scientist "langstroth".

{% highlight javascript %}
// Firt of all, try the update
var result = db.test.update(
    {date: ISODate("2015-08-01T00:00:00.000Z"), location: 1, scientist: "langstroth"},
    {$inc :{
              butterflies: 1,
              honeybees: 1,
              "days.0.butterflies": 1,
              "days.0.honeybees": 1,
              "days.0.hours.0.butterflies": 1,
              "days.0.hours.0.honeybess": 1,
              "days.0.hours.0.minutes.6.butterflies": 1,
              "days.0.hours.0.minutes.6.honeybess": 1,
            }
    },
    {upsert: false}
);
// If the update do not succeed, then try to insert the document
if (result.nModified === 0) {
    try {
        db.test.insert(/* Put here the whole document */);
    } catch (err) {
        console.log(err);
    }
    // Here we are sure that the document exists.
    // Retry to execute the update statement
    db.test.update(/* Same update as above */);
}
{% endhighlight %}

Clearly, what makes the above procedure working is the guarantee of atomicity on document modification. I know,
the procedure is a little bit creepy, but we did not find anything better at the moment. Do you have any better idea?
If so, try to explain it in the comment section. Thanks!

#### References
 - [Time series](https://en.wikipedia.org/wiki/Time_series)
 - [InfluxDB Key Concepts](https://docs.influxdata.com/influxdb/v1.2/concepts/key_concepts/)
 - [Schema Design for Time Series Data in MongoDB](https://www.mongodb.com/blog/post/schema-design-for-time-series-data-in-mongodb)
 - [MongoDB for Time Series Data Part 1: Setting the Stage for Sensor Management](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management)
 - [MongoDB for Time Series Data Part 2: Analyzing Time Series Data Using the Aggregation Framework and Hadoop](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management)
 - [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/aggregation/)
 - [MongoDB Collection update: initialize a document with default values](https://stackoverflow.com/questions/41552405/mongodb-collection-update-initialize-a-document-with-default-values)
