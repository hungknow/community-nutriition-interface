import { render, screen } from '@testing-library/react'
import { WeightEvaluation } from './weight-evaluation'

jest.mock('d3');

test('WeightEvaluation - render OK', () => {
    render(<WeightEvaluation />)
})
