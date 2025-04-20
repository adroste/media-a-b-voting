import { trainEloModel } from './elo'
import { Vote } from '../vote'

describe('rating elo algorithm', () => {
  describe('trainEloModel', () => {
    it('should output elo values from indirect comparison votes', () => {
      const votes: Vote[] = [
        ['1', '2', 'a'],
        ['2', '3', 'a'],
        ['3', '4', 'a'],
      ]
      const elo = trainEloModel(votes)

      expect(elo['1']!).toBeGreaterThan(elo['2']!)
      expect(elo['2']!).toBeGreaterThan(elo['3']!)
      expect(elo['3']!).toBeGreaterThan(elo['4']!)
    })

    it('should output elo values from indirect comparison votes, including ties', () => {
      const votes: Vote[] = [
        ['1', '2', 'a'],
        ['2', '3', 'a'],
        ['3', '4', 'tie'],
        ['3', '5', 'a'],
      ]
      const elo = trainEloModel(votes)

      expect(elo['1']!).toBeGreaterThan(elo['2']!)
      expect(elo['2']!).toBeGreaterThan(elo['3']!)
      expect(elo['2']!).toBeGreaterThan(elo['4']!)
      expect(elo['3']!).toBeGreaterThan(elo['5']!)
      expect(elo['4']!).toBeGreaterThan(elo['5']!)
    })
  })
})
