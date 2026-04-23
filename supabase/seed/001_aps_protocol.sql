do $$
declare
  protocol_id uuid := gen_random_uuid();
  version_id uuid := gen_random_uuid();
begin

insert into public.protocols (id, slug, title, type, status, current_version_id)
values (
  protocol_id,
  'aps-dolor-agudo-postoperatorio',
  'Protocolo de Dolor Agudo Postoperatorio (APS)',
  'agudo',
  'published',
  version_id
);

insert into public.protocol_versions (
  id, protocol_id, version_number, content, bibliography, generated_by, published_at
) values (
  version_id,
  protocol_id,
  1,
  '{
    "objetivo": "Garantizar el control efectivo del dolor agudo postoperatorio en todos los pacientes quirúrgicos de Clínica Iberoamérica, logrando NRS ≤ 3 en reposo y ≤ 5 en movimiento al alta del servicio APS.",
    "alcance": "Todos los pacientes adultos sometidos a cirugía bajo anestesia general, regional o sedoanalgesia en Clínica Iberoamérica. Excluye cirugías ambulatorias menores con anestesia local exclusiva.",
    "activacion": {
      "pasos": [
        "Cirujano o anestesiólogo activa APS en Sophia al momento de programar o iniciar la cirugía",
        "Médico de apoyo realiza valoración en PACU dentro de las primeras 2 horas postoperatorias",
        "Aplicar NRS al ingreso a PACU, a los 30 minutos y al egreso",
        "Si NRS > 4 en PACU: escalar según protocolo de analgesia multimodal",
        "Ronda diaria del servicio de dolor en piso de hospitalización",
        "Alta APS: NRS ≤ 3 reposo, ≤ 5 movimiento, tolerancia oral, plan de egreso documentado"
      ]
    },
    "evaluacion": {
      "escala_principal": "NRS 0-10",
      "momentos": ["Ingreso PACU", "30 min post-ingreso PACU", "Egreso PACU", "Cada 6h hospitalización", "Alta APS"],
      "umbrales": {
        "leve_1_3": "Analgesia programada vigente",
        "moderado_4_6": "Rescate con ketorolaco IV o tramadol",
        "severo_7_10": "Morfina IV titulada + aviso al algiólogo de turno"
      }
    },
    "farmacologia": {
      "preoperatorio": {
        "farmacos": ["Paracetamol 1g VO", "Celecoxib 200-400mg VO (selectivo)", "Pregabalina 75-150mg VO (cirugías mayores)"]
      },
      "intraoperatorio": {
        "descripcion": "Anestesia regional guiada por ultrasonido según ESRA PROSPECT"
      },
      "pacu": {
        "escalon_1_NRS_1_3": "Paracetamol 1g IV",
        "escalon_2_NRS_4_6": "Ketorolaco 30mg IV",
        "escalon_3_NRS_7_10": "Morfina 2mg IV c/5min hasta NRS ≤ 4 (máx 10mg)"
      },
      "piso": {
        "base": "Paracetamol 1g IV/VO c/6h",
        "complemento": "AINE c/8h (ibuprofeno 400mg VO o ketorolaco 15mg IV)",
        "rescate": "Tramadol 50mg IV o morfina 2-4mg IV"
      },
      "egreso": {
        "plan": "Paracetamol 500-1000mg c/6-8h + ibuprofeno 400mg c/8h por 5 días",
        "condicion": "NRS ≤ 3 reposo sostenido, tolerancia oral establecida"
      }
    },
    "criterios_alta": [
      "NRS ≤ 3 en reposo",
      "NRS ≤ 5 en movimiento activo",
      "Tolerancia a la vía oral establecida",
      "Plan de analgesia domiciliaria documentado en Sophia",
      "Paciente educado sobre escala NRS y cuándo consultar"
    ],
    "criterios_escalonamiento": [
      "NRS ≥ 7 en hospitalización: aviso inmediato al algiólogo de turno",
      "NRS sin respuesta < 30% en 2 ciclos de rescate: aviso al algiólogo",
      "Sospecha de complicación: evaluación quirúrgica urgente"
    ]
  }'::jsonb,
  '[
    "Chou R, et al. Management of Postoperative Pain: Guideline from APS, ASRA, and ASA. J Pain. 2016;17(2):131-157.",
    "PROSPECT Working Group / ESRA. Procedure-Specific Postoperative Pain Management. esraeurope.org/prospect. 2026.",
    "Horn R, et al. Postoperative Pain Control. StatPearls. NCBI NBK544298. 2024.",
    "Clinical practice guidelines for postoperative pain management in adults (2024 edition). Regional Anesthesia and Acute Pain Medicine. 2025."
  ]'::jsonb,
  'manual',
  now()
);

end $$;
