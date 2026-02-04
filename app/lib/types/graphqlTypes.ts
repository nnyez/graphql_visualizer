export interface Person {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  photoUrl?: string;
  relationships?: Person[];
  relationshipsConnection?: PersonRelationshipConnection;
}

export interface PersonRelationshipConnection {
  edges: PersonRelationshipsRelationship[];
  totalCount: number;
}

export interface PersonRelationshipsRelationship {
  node: Person;
  properties: RelationshipProperties;
}

export enum RelationshipStatus {
  FRIEND = "FRIEND",
  FAMILY = "FAMILY",
  COLLEAGUE = "COLLEAGUE",
}
export interface RelationshipProperties {
  status: RelationshipStatus;
  frecuency: number;
  importance: number;
}
export interface PersonWhere {
  id?: string;
  name?: string;
  nickname?: string;
  email?: string;
  photoUrl?: string;
  AND?: PersonWhere[];
  OR?: PersonWhere[];
}

export interface PersonRelationshipsConnectionWhere {
  edge: RelationshipPropertiesWhere;
  node: PersonWhere;
  AND?: PersonRelationshipsConnectionWhere[];
  OR?: PersonRelationshipsConnectionWhere[];
}

export interface RelationshipPropertiesWhere {
  frecuency?: number;
  importance?: number;
  status?: RelationshipStatus;
  AND?: RelationshipPropertiesWhere[];
  OR?: RelationshipPropertiesWhere[];
}
