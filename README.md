# ConFusion REST API Server

> This project was made during the Server-side Development with NodeJS, Express and MongoDB course, by Jogesh Muppala on Coursera.

<p align="center">
  <img src="https://github.com/NietoCurcio/Confusion-REST-API-Server/blob/main/.github/endpoints.png?raw=true" width="800" alt="Confusion REST API Server">
</p>

## Firebase & Loopback - Backend as a Service

One of my favorite's parts of this course, it goes into BaaS. This module shows a server project using [Loopback 3](https://loopback.io/doc/en/lb3/) (a BaaS acquired by IBM), setting up models, datasource, repository, controllers, Role-based Access control and relations. Beyond, goes into Firebase (a BaaS by Google), shows how to set up Firestore and its rules on read and write operations, storage and authentication. Further, integrates an Angular and React client-side applications to Firebase and Loopback.

## Mongoose

This project uses MongoDB as database and Mongoose ODM to manage our documents. The business logic layer takes care of allowing faith actions to be performed, for example, only the own user that has posted its comment, can update or delete it. You learn about CRUD operations on documents with mongoose, but also mongoose subdocuments, mongoose population and to take care with populations to do not overhead the server, since a document expects more to be self-contained than make a lot of relations or references with another documents, as would in a relational database.

## Authentication & Authorization

Authentication lesson flow:

- Basic
- Cookies
- Cookies & Sessions (express-session)
- Passport (LocalStrategy, JwtStrategy) _REST_

Some approaches of authentication have been made in the server, but the final uses Json Web tokens. It started implementing a Basic authentication, sending a challenging in the WWW-Authenticate header with Basic as value, the credentials send to the server is base-64 encoded, Nodejs has built-in modules to handle it. After it adds cookies to the client side, so that the server can remember about the client, further, implements sessions using "express-session" module, note that when talking about cookies we must be concerned with Cross-site request forgery (CSRF), that a malicious user makes an exploit, to make requests from an user that the server would trust. However, maintain a state of its clientes it's not scalable, does not follow REST constraints (quoted below), then we use Passport, an authentication library, together with passport-local and passport-jwt strategies, so all information about what user is sending the request is enconded in the Authorization header of the request, the users is a token Bearer, that carry their token with them to the requets.

This course also talks about CORS (Cross-Origin Resource Sharing), as also Preflight and credential requests.

## REST API Constraints

According to Roy Thomas Fielding, author of "Architectural Styles and the Design of Network-based Software Architectures" PhD dissertation, in chapter 5 - Representational State Transfer (REST) on topic 5.1.3, "(...) client-server interaction: communication must be stateless in nature, as in the client-stateless-server (CSS) style of Section 3.4.3 (Figure 5-3), such that each request from client to server must contain all of the information necessary to understand the request, and cannot take advantage of any stored context on the server. Session state is therefore kept entirely on the client.". REST architecture induces visibility, reliability, and scalability.

### Facebook OAuth

To make Facebook OAuth passport-facebook. To make use an OAuth service, you must register your application server (as a client) to the server that it is going to connect (server). So that you got a clientId and clientSecret to connect to the OAuth service.

<p align="center">
  <img src="https://github.com/NietoCurcio/Confusion-REST-API-Server/blob/main/.github/oauth.png?raw=true" width="700" alt="Confusion REST API Server">
</p>

## About this course

Server-side Development with NodeJS, Express and MongoDB is part of a specialization that now contains three courses, the Full-Stack Web Development with React on Coursera, a platform that offers online courses provided by universities around the World. The author of this Course is Jogesh K. Muppala an associate professor in the Department of Computer Science and Engineering, The Hong Kong University of Science and Technology.
