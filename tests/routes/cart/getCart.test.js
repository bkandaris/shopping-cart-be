const request = require('supertest')
const server = require('../../../server')
const Product = require('../../../models/product')
const Seller = require('../../../models/seller')
const Store = require('../../../models/store')
const Cart = require('../../../models/cart')

let token
let cartId
let storeId
let product1Id
let product2Id

async function clearDb() {
  await Seller.deleteMany({})
  await Product.deleteMany({})
  await Store.deleteMany({})
  await Cart.deleteMany({})
}

beforeEach(() => {
  jest.setTimeout(10000)
})

beforeAll(async () => {
  jest.setTimeout(10000)
  try {
    await clearDb()
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        phone: '+233276202069',
        password: 'password12345'
      })

    token = response.body.token

    const store = await request(server)
      .post('/api/store')
      .send({
        storeName: 'Laptops & Phones',
        ownerName: 'Jane Doe',
        currency: 'dollars',
        imageUrl: 'some image',
        address: 'no 337 rous road'
      })
      .set('Authorization', token)
    storeId = store.body.saved._id

    // add item to cart
    const cart = await request(server)
      .post(`/api/store/${storeId}/cart`)
      .send({
        storeId: storeId,
        contents: [
          { product: product1Id, quantity: 3 },
          { product: product2Id, quantity: 30 }
        ],
        agreedPrice: 40,
        total: 400,
        email: 'test@gmail.com'
      })
    console.log(cart.body)

    cartId = cart.body._id
  } catch (error) {
    console.error(error.name, error.message)
  }
})

describe('get cart contents', () => {
  it('should return store not found', async () => {
    const response = await request(server).get(
      '/api/store/cart/5e1ee0099f037d24abba6aa9'
    )

    expect(response.status).toBe(404)
    expect(response.body.message).toBeDefined()
    expect(response.body).toEqual({ message: 'No cart found' })
  })

  xit('should return found store with details', async () => {
    const response = await request(server).get(`/api/store/cart/${cartId}`)
    console.log(response.body)
    expect(response.status).toBe(200)
    expect(response.body.contents).toBeDefined()
    expect(response.body.checkedOut).toBeDefined()
    expect(response.body.agreedPrice).toBeDefined()
    expect(response.body.total).toBeDefined()
    expect(response.body.storeId).toBeDefined()
    expect(response.body.checkoutDate).toBeDefined()
  })

  it('should return type error with wrong id', async () => {
    const response = await request(server).get('/api/store/cart/wrongId/')
    expect(response.status).toBe(500)
    expect(response.body).toBeDefined()
  })
})
