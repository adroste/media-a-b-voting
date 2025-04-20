import { trainDavidsonModel } from './davidson'
import { Vote } from '../vote'

describe('rating davidson algorithm', () => {
  describe('trainDavidsonModel', () => {
    it('should output beta values from indirect comparison votes', () => {
      const votes: Vote[] = [
        ['1', '2', 'a'],
        ['2', '3', 'a'],
        ['3', '4', 'a'],
      ]
      const betas = trainDavidsonModel(votes)

      expect(betas['1']!).toBeGreaterThan(betas['2']!)
      expect(betas['2']!).toBeGreaterThan(betas['3']!)
      expect(betas['3']!).toBeGreaterThan(betas['4']!)
    })

    it('should output beta values from indirect comparison votes, including ties', () => {
      const votes: Vote[] = [
        ['1', '2', 'a'],
        ['2', '3', 'a'],
        ['3', '4', 'tie'],
        ['3', '5', 'a'],
      ]
      const betas = trainDavidsonModel(votes)

      expect(betas['1']!).toBeGreaterThan(betas['2']!)
      expect(betas['2']!).toBeGreaterThan(betas['3']!)
      expect(betas['2']!).toBeGreaterThan(betas['4']!)
      expect(betas['3']!).toBeGreaterThan(betas['5']!)
      expect(betas['4']!).toBeGreaterThan(betas['5']!)
    })
  })
})
