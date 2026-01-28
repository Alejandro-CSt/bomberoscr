import { z } from "@hono/zod-openapi";

export const TypeCodeRequest = z.object({
  code: z.string().openapi({
    param: { name: "code", in: "path", required: true },
    example: "1.1.1.4",
    description: "Incident type code (e.g., '1' for fire, '6.1.1.2.1' for snake rescue)"
  })
});

export const TypeIncludeRequest = z.object({
  include: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .every((item) => item === "children" || item === "ancestors");
      },
      {
        message: "include must be 'children', 'ancestors', or a comma-separated combination"
      }
    )
    .openapi({
      description: "Comma-separated includes: children, ancestors",
      param: { in: "query" },
      example: "ancestors,children"
    })
});

export const TypeSummary = z.object({
  code: z.string().openapi({
    description: "Incident type code",
    example: "1.1.1.4"
  }),
  name: z.string().openapi({
    description: "Incident type name",
    example: "ALMACEN FISCAL"
  }),
  parentCode: z.string().nullable().openapi({
    description: "Parent incident type code",
    example: "1.1.1"
  }),
  level: z.number().int().openapi({
    description: "Depth level based on code segments",
    example: 4
  })
});

export const TypesListResponse = z.object({
  items: z.array(TypeSummary).openapi({
    description: "Flat list of incident types",
    example: [
      { code: "1", name: "EMERGENCIAS POR FUEGO", parentCode: null, level: 1 },
      { code: "1.1", name: "EN ESTRUCTURAS", parentCode: "1", level: 2 },
      { code: "1.1.1", name: "ALMACENAMIENTO", parentCode: "1.1", level: 3 },
      { code: "1.1.1.4", name: "ALMACEN FISCAL", parentCode: "1.1.1", level: 4 }
    ]
  })
});

export const TypeChild = z.object({
  code: z.string().openapi({
    description: "Child incident type code",
    example: "1.1.1.4"
  }),
  name: z.string().openapi({
    description: "Child incident type name",
    example: "ALMACEN FISCAL"
  })
});

export const TypeAncestor = z.object({
  code: z.string().openapi({
    description: "Ancestor incident type code",
    example: "1.1.1"
  }),
  name: z.string().openapi({
    description: "Ancestor incident type name",
    example: "ALMACENAMIENTO"
  }),
  level: z.number().int().openapi({
    description: "Depth level based on code segments",
    example: 3
  })
});

export const TypeCodeResponse = z.object({
  type: TypeSummary,
  children: z
    .array(TypeChild)
    .optional()
    .openapi({
      description: "Direct children of this incident type",
      example: [
        { code: "1.1.1.1", name: "BODEGAS" },
        { code: "1.1.1.2", name: "SILOS" },
        { code: "1.1.1.3", name: "TANQUES" },
        { code: "1.1.1.4", name: "ALMACEN FISCAL" }
      ]
    }),
  ancestors: z
    .array(TypeAncestor)
    .optional()
    .openapi({
      description: "Ancestors of this incident type",
      example: [
        { code: "1", name: "EMERGENCIAS POR FUEGO", level: 1 },
        { code: "1.1", name: "EN ESTRUCTURAS", level: 2 },
        { code: "1.1.1", name: "ALMACENAMIENTO", level: 3 }
      ]
    })
});
