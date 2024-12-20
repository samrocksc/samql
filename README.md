# A Prisma Query Language for @isaacs LRU-Cache

## Technical Decisions

---

When starting this project I wanted to first get a little bit of inspiration from open source projects. I referenced in particular open source packages, and here are the decisions I made

### **Scope** Things I'm leaving at the front door but take into future considerations

---

1. **indexing** - I'm not going to worry about indexing at this point, but it's something that I'll need to consider in the future.
   1. **Recommendation** is to handle indexing by building a Trie structure(I'd recommend this [Trie](https://www.npmjs.com/package/trie-search)) package. This allows us to build a tree structure that relates back to an ID.
2. **caching** - I'm not going to worry about caching at this point, but it's something that I'll need to consider in the future.
   1. **Recommendation** is to handle caching by building a LRU cache structure(I'd recommend this [LRU-Cache](https://www.npmjs.com/package/lru-cache)) package.
3. **Security** - I'm not going to worry about security at this point, but it's something that I'll need to consider in the future. To me though a database is only as secure as its implementer. So I think this may be a userland feature that we can add in the future. Plain-text attacks are definitely a clear attack vector here though.
   1. **Recommendation** All security measures should be built with intentionality. Meaning that using 3rd party libraries like Lodash probably isn't a good move. My experience is that Lodash is typically one of the most sought after vulnerability hunts by hackers. So I'd recommend building your own security measures.

### Memory Loading Choice - PapaParse

---

Having used Papaparse in the past I

### Inspirations - Things I've used that I liked, and wanted to use for inspiration

---

- [SQL-92](https://en.wikipedia.org/wiki/SQL-92) - I wanted to use a SQL-92 standard for the query language, as it's the most widely used standard for SQL
- [knex](https://knexjs.org/) - a query builder that can be used for just about anything
- [prisma](https://www.prisma.io/) - c'mon ;o) you folks wrote the best there is on this
- [sequelize](https://sequelize.org/) - a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server. It features solid transaction support, relations, read replication and more.

## About the Language

---

A lot of what I did here was breaking down how I thought about a query language and building a glossary of terms:

```sql
PROJECT col1, col2 FILTER col3 > "value"
```

1. Operations - `PROJECT`, `FILTER`
2. Columns - `col1`, `col2`, `col3`
3. Operators - `>`, `<`, `=`, `!=`,

Using this information I was able to generate a _very_ rough looping piece of code to start building a healthy pattern for orders of operations. This allows me to ensure that once we start moving towards recursion and more complex queries, we can ensure that we're following the correct order of operations.

Now I have a basic

## About the Loader

---

I want the loader to be part of my feature set to _plug in_ to our query language. There are some things I wanted to have to make error handling easier, and to give the users a head start on building.

## About the Process

---

So I wanted to keep things as stripped down as possible so I could design by types, and build implementations. I'm a bit of a fan of Kyle Simpson's [functional lite javascript](https://github.com/getify/Functional-Light-JS).

I started off really just getting a feel for the data, and what was coming in and coming out. While I've built atleast a hundred data parsers at this point in my life ensuring they were in proper ordinality was a bit of a challenge.

To solve this I built a feature I really enjoy in my favourite Query Builders, debuggers!

if you want to use it feel free to do `DEBUG=samql:<info | error | debug | query> npx nx serve prismapg` to access the different logs

I really wanted this application to fail often and fail fast, so by returning the header meta data I was able to

So here ultimately is the format I'd like this to look like:

```typescript
import samQl from 'samql';

const main = () => {
  const users = samQl.load('users.csv');
  const devices = samQl.load('devices.csv');

  const user = users.query('PROJECT name FILTER id > 1');
};
```

This allows for stronger extension later on and building the _escape hatch_ into the query language if we choose to build a query builder

### Process

---

I want to do the last amount of work possible before a failure to fail fast. Filtering/ordering and retrieval were probably going to be our most expensive commands, but retrieval was a requirement before the other 2 so it was unavoidable:

Each of these methods contains a different dependence inversion, but will always carry one core inversion. For this I used a bit of functional composition to keep my function arity at 1.

- **load**
- **parse**
- **retrieve**
- **filter**
- **order**

- `apps/prismapg/src/app/app.component.ts` - The main entry point for the application
- `libs/samql/src/lib/samql.ts` - The main entry point for the query language
- `libs/samql/src/lib/loader.ts` - The main entry point for the loading of files
- `libs/samql/src/lib/parser.ts` - The main entry point for the parsing of a query, this should not do any data fetching
- `libs/samql/src/lib/retriever.ts` - The main entry point for the execution of a query, this should do the data fetching
- `libs/samql/src/lib/filter.ts` - The main entry point for the filtering of a query
- `libs/samql/src/lib/order.ts` - The main entry point for the ordering of a query

```mermaid
flowchart TD
    A["index"] -- "utf-8 string" --> B("loader")
    B -- (IQueryInput)(string) --> n1["query"]
    n1 <-- (IParseInput) --> n2["parser"]
    n3["retriever"] -- IFilterInput --> n4["filter"]
    n4 -- IOrderInput --> n5["order"]
    n1 -- IRetrieverInput --> n3
    n2 --> n6["Operation Nodes"]
    n6 --> n7["Recursive joins"]
    n6 -.-> n2
    n7 -.-> n6

    n6@{ shape: lean-l}
    n7@{ shape: lean-l}
```
