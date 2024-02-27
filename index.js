import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
/* example typeDefs:
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;
const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];
*/
// import mock data
import db from "./_db.js";
// types
import { typeDefs } from "./schema.js";

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  /*  example resolver function
  Query: {
    books: () => books,
  },
  */
  Query: {
    games: () => {
      return db.games;
    },
    game: (_, args) => {
      return db.games.find((game) => game.id === args.id);
    },
    authors: () => {
      return db.authors;
    },
    author: (_, args) => {
      return db.authors.find((author) => author.id === args.id);
    },
    reviews: () => {
      return db.reviews;
    },
    // (parent, args, context)
    review: (_, args) => {
      return db.reviews.find((review) => review.id === args.id);
    },
  },
  Game: {
    reviews: (parent) => {
      return db.reviews.filter((r) => r.game_id === parent.id);
    },
  },
  Author: {
    reviews: (parent) => {
      return db.reviews.filter((r) => r.author_id === parent.id);
    },
  },
  Review: {
    author: (parent) => {
      return db.authors.find((a) => a.id === parent.author_id);
    },
    game: (parent) => {
      return db.games.find((g) => g.id === parent.game_id);
    },
  },
  Mutation: {
    addGame: (_, args) => {
      let game = {
        ...args.game,
        id: Math.floor(Math.random() * 1000).toString(),
      };
      db.games.push(game);
      return game;
    },
    deleteGame: (_, args) => {
      return db.games.filter((g) => g.id !== args.id);
    },
    updateGame: (_, args) => {
      db.games = db.games.map((g) => {
        if (g.id === args.id) return { ...g, ...args.edits };
        return g;
      });
      return db.games.find((g) => g.id === args.id);
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
