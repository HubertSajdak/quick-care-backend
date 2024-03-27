# Quick-Care

Backend REST-API for Care Point Dashboard application.

Quick-Care is a backend for Care Point application that allows users to quickly make an appointment with a doctor and
track their upcoming visits. I used Node with Express framework and MongoDB as a database.

Doctors are allowed to add new clinics to the database and assign them as their workplaces by providing information
like: consultation fee, consultation time, working hours

Patients can find their most suitable doctor and make an appointment in one of the doctor's workplaces

## Motivation

My motivation to do this project was to improve my backend programming skills by creating a REST-API for Care Point
application.

## Tech Stack

**Client:** React, TypeScript, Redux, React-Router, Styled-Components, Axios, Formik, Yup, i18n, Dayjs, React-Toastify,
Husky,

**Server:** Node, Express, TypeScript, moment.js, Bcryptjs, joi, JWT, Morgan, Validator

## Features

- Patient / Doctor registration and login
- Handling private endpoints, authorization and authentication via JWT
- Change user info
- Change user password
- Creating / canceling appointments
- Creating / updating / removing clinics
- Creating / updating / removing doctor's clinic affiliations
- Creating / updating / removing doctor's specializations

## Demo

* Frontend: https://care-point.vercel.app/