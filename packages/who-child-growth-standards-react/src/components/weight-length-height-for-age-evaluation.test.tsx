import { render } from '@testing-library/react'
import { WeightOrLengthOrHeightForAgeEvaluation } from './weight-length-height-for-age-evaluation'

jest.mock('d3');

test('WeightEvaluation - render OK', () => {
    render(<WeightOrLengthOrHeightForAgeEvaluation />)
})
