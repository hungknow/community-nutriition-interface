import { createEcosystem, EcosystemProvider } from "@zedux/react";
import { WeightEvaluationResult } from "./weight-evaluation-result";
import { weightEvaluationRequestAtom } from "@/atoms/weight-evaluation-atom";
import { Gender } from "who-child-growth-standards";

const ecosystemGirl2Years = createEcosystem({
    id: 'root',
    onReady: ecosystem => {
        const weightEvaluationRequestAtomNode = ecosystem.getNode(weightEvaluationRequestAtom, [])
        weightEvaluationRequestAtomNode.set({
            weight: 10,
            length: 90,
            birthdate: new Date('2025-01-01'),
            gender: Gender.Female
        })
    },
})

const ecosystemGirl4Years = createEcosystem({
    id: 'root',
    onReady: ecosystem => {
        const weightEvaluationRequestAtomNode = ecosystem.getNode(weightEvaluationRequestAtom, [])
        weightEvaluationRequestAtomNode.set({
            weight: 10,
            length: 90,
            birthdate: new Date('2023-01-01'),
            gender: Gender.Female
        })
    },
})


export default {
    girl2Years: (
        <EcosystemProvider ecosystem={ecosystemGirl2Years}>
            <WeightEvaluationResult />
        </EcosystemProvider>
    ),
    girl4Years: (
        <EcosystemProvider ecosystem={ecosystemGirl4Years}>
            <WeightEvaluationResult />
        </EcosystemProvider>
    )
}
