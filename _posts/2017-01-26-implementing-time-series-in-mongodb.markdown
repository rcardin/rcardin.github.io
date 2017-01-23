---
layout: post
title:  "Implementing Time Series in MongoDB"
date:   2017-01-26 17:34:12
comments: true
categories: database mongodb time-series
tags:
    - database
    - mongodb
    - time-series
summary: "I came recently to design a solution for MongoDB to store information that has time as the
          main axis of analysis. This information should be stored in a way that was easy enough to
          query and aggregate using many different time granularity (months, weeks, days, ...). Information
          should also be stored in a way that does not consume too much disk space and was optimal in performance
          for MongoDB to maintain. In a word, I need to transform MongoDB in a Time series database."
social-share: true
social-title: "Implementing Time Series in MongoDB"
social-tags: "database, mongodb"
---

I came recently to design a solution for MongoDB to store information that has time as the
main axis of analysis. This information should be stored in a way that was easy enough to
query and aggregate using many different time granularity (months, weeks, days, ...). Information
should also be stored in a way that does not consume too much disk space and was optimal in performance
for MongoDB to maintain. In a word, I need to transform MongoDB in a Time series database.

#### Time series

Let's start from the beginning. What is a *time series*. Citing [Wikipedia](https://en.wikipedia.org/wiki/Time_series):

> A time series is a series of data points indexed (or listed or graphed) in time order. Most commonly, a time series
  is a sequence taken at successive equally spaced points in time. Thus it is a sequence of discrete-time data.

InfluxDB [Key Concepts page](https://docs.influxdata.com/influxdb/v1.1/concepts/key_concepts/) gives us an extremely
easy example to understand of what a time series is. Imagine you have two scientists that have to record the number of
two type of insects in two different locations. Using a tabular view, we come across something like this.

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

#### References
 - [Time series](https://en.wikipedia.org/wiki/Time_series)
 - [InfluxDB Key Concepts](https://docs.influxdata.com/influxdb/v1.1/concepts/key_concepts/)