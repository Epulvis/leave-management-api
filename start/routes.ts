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
import AuthController from 'App/Interfaces/Http/Controllers/AuthController'

Route.group(() => {
  Route.post('/register', async (ctx) => {
    return new AuthController().register(ctx)
  })
  Route.post('/login', async (ctx) => {
    return new AuthController().login(ctx)
  })
  
  // Contoh route terproteksi untuk mengetes Token
  Route.get('/me', async ({ auth, response }) => {
    await auth.use('api').authenticate()
    return response.json({ user: auth.use('api').user })
  }).middleware('auth')

}).prefix('/api/v1')
