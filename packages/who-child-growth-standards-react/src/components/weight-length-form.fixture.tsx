import { WeightLengthForm, type WeightLengthFormData } from './weight-length-form';

export default {
  default: (
    <WeightLengthForm
      onSubmit={(data: WeightLengthFormData) => {
        console.log('Form submitted with data:', data);
      }}
    />
  ),
};