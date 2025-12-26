import { heightForAgeGirl0To2Years, heightForAgeGirl2To5Years, lengthForAgeGirl0To13Weeks, LengthOrHeightForAgeType } from "who-child-growth-standards";
import { D3JsLengthOrHeightForAge } from "./d3js-length-or-height-for-age";

export default {
    "girl-under-13-weeks": <D3JsLengthOrHeightForAge lengthOrHeightForAgeType={LengthOrHeightForAgeType.Length} lengthForAgeDataset={lengthForAgeGirl0To13Weeks} title="Length-for-age" subtitle="Girls, Birth to 13 weeks" xAxisLabel="Age (weeks)" yAxisLabel="Length (cm)" currentAge={10} currentLengthOrHeight={100} />,
    "girl-0-to-2-years": <D3JsLengthOrHeightForAge lengthOrHeightForAgeType={LengthOrHeightForAgeType.Height} heightForAgeDataset={heightForAgeGirl0To2Years} title="Height-for-age" subtitle="Girls, Birth to 2 years" xAxisLabel="Age (months)" yAxisLabel="Height (cm)" currentAge={10} currentLengthOrHeight={100} />,
    "girl-2-to-5-years": <D3JsLengthOrHeightForAge lengthOrHeightForAgeType={LengthOrHeightForAgeType.Height} heightForAgeDataset={heightForAgeGirl2To5Years} title="Height-for-age" subtitle="Girls, 2 to 5 years" xAxisLabel="Age (years)" yAxisLabel="Height (cm)" currentAge={10} currentLengthOrHeight={100} />,
}
