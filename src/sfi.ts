import {defineService} from '@snek-at/function'

enum Colors {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}

const helloWorld = () => {
  return 'Hello world!'
}

export default defineService(
  {
    Query: {
      helloWorld,
      crashBecauseOfBoolean: (): boolean => {
        return true
      },
      getFavColor: (): Colors => {
        return Colors.Red
      }
    }
  },
  {
    configureApp(app) {
      return app
    }
  }
)
