<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Subscription Management System - A full-stack SaaS application for managing user subscriptions, built with Nest (backend), React (frontend), and Stripe for payment processing.
Features

  - User Authentication: JWT-based registration and login with role-based access control (RBAC).
  - Subscription Management: Users can subscribe, upgrade, downgrade, or cancel plans.
  - Stripe Integration: Secure payment flows, webhooks, and plan management.
  - Admin Panel: Admin endpoints for user and system management.
  - Email Notifications: Automated emails via Nodemailer.
  - Robust Security: DTO validation, global error handling, logging, and CORS.
  - Production-Ready Practices: Environment variable management, logging, and more.

## Project Structure

  - /src         # NestJS backend source code
  - /frontend    # React frontend source code
  - /scripts     # Utility scripts (e.g., migrations)
  - .env         # Environment variables (not committed)

## Running The Backend

 - npm run start:dev

##Running The Frontend

 - npm start

## API Documentation

 - Swagger UI is available at:
 -  http://localhost:3001/api
 - Key Endpoints
 - POST /auth/register — Register a new user
 - POST /auth/login — Login and receive JWT
 - GET /auth/me — Get current user info
 - GET /subscriptions — List all plans
 - POST /subscriptions — Subscribe to a plan
 - GET /subscriptions/my-subscriptions — View your subscriptions
 - POST /webhook — Stripe webhook endpoint

## Stripe Integration
 - Uses Stripe Elements on the frontend for secure card input.
 - Backend handles payment intent creation and webhook processing.
 - Ensure your Stripe keys are set in .env.


## Email Notifications

 - Uses Nodemailer with Gmail.

## Some Working Examples Images


<img width="1593" height="678" alt="register" src="https://github.com/user-attachments/assets/f1079d51-62ec-414d-81ed-518426d837f4" />

<img width="1593" height="678" alt="login" src="https://github.com/user-attachments/assets/87754676-61e9-4b55-af00-1df97664ccb7" />

<img width="1719" height="975" alt="login-page" src="https://github.com/user-attachments/assets/ed302ec2-e791-4999-a7f8-ff90abf7e790" />

<img width="1844" height="930" alt="logged-in-page" src="https://github.com/user-attachments/assets/3b08c77d-48ac-458c-a644-f3b9a2aa20a2" />

<img width="1844" height="930" alt="subscription-created" src="https://github.com/user-attachments/assets/368123f7-38a4-4819-987c-210b472f6e6e" />

<img width="1817" height="950" alt="users-table" src="https://github.com/user-attachments/assets/5baf183e-456b-4ef7-8518-213414ff64b1" />

<img width="1844" height="930" alt="refund" src="https://github.com/user-attachments/assets/2aaa485b-4924-48c7-a74e-b0ea1aa058a7" />

<img width="1807" height="869" alt="downgrade" src="https://github.com/user-attachments/assets/bcb9a398-7114-4972-ad1b-abc50ac17d55" />

## Project setup



```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
