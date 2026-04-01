/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import AdminLeaveController from 'App/Interfaces/Http/Controllers/AdminLeaveController'
import AuthController from 'App/Interfaces/Http/Controllers/AuthController'
import LeaveController from 'App/Interfaces/Http/Controllers/LeaveController'
import OAuthController from 'App/Interfaces/Http/Controllers/OAuthController'

Route.group(() => {
  Route.post('/register', async (ctx) => {
    return new AuthController().register(ctx)
  })
  Route.post('/login', async (ctx) => {
    return new AuthController().login(ctx)
  })
  Route.get('/oauth/:provider/redirect', async (ctx) => {
      return new OAuthController().redirect(ctx)
  })
  Route.get('/oauth/:provider/callback', async (ctx) => {
      return new OAuthController().callback(ctx)
  })
  
  Route.group(() => {
    Route.post('/leaves/apply', async (ctx) => {
      return new LeaveController().apply(ctx)
    })
    Route.get('/leaves/history', async (ctx) => {
      return new LeaveController().getMyHistory(ctx)
    })
    Route.get('/admin/leaves', async (ctx) => {
      return new AdminLeaveController().index(ctx)
    })
    Route.patch('/admin/leaves/:id/execute', async (ctx) => {
      return new AdminLeaveController().executeStatus(ctx)
    })

  }).middleware('auth')

}).prefix('/api/v1')
