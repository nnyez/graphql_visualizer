export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Count = {
  __typename?: 'Count';
  nodes: Scalars['Int']['output'];
};

export type CountConnection = {
  __typename?: 'CountConnection';
  edges: Scalars['Int']['output'];
  nodes: Scalars['Int']['output'];
};

/** Information about the number of nodes and relationships created during a create mutation */
export type CreateInfo = {
  __typename?: 'CreateInfo';
  nodesCreated: Scalars['Int']['output'];
  relationshipsCreated: Scalars['Int']['output'];
};

export type CreatePeopleMutationResponse = {
  __typename?: 'CreatePeopleMutationResponse';
  info: CreateInfo;
  people: Array<Person>;
};

/** Information about the number of nodes and relationships deleted during a delete mutation */
export type DeleteInfo = {
  __typename?: 'DeleteInfo';
  nodesDeleted: Scalars['Int']['output'];
  relationshipsDeleted: Scalars['Int']['output'];
};

/** ID filters */
export type IdScalarFilters = {
  contains?: InputMaybe<Scalars['ID']['input']>;
  endsWith?: InputMaybe<Scalars['ID']['input']>;
  eq?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<Scalars['ID']['input']>>;
  startsWith?: InputMaybe<Scalars['ID']['input']>;
};

/** ID mutations */
export type IdScalarMutations = {
  set?: InputMaybe<Scalars['ID']['input']>;
};

export type IntAggregateSelection = {
  __typename?: 'IntAggregateSelection';
  average?: Maybe<Scalars['Float']['output']>;
  max?: Maybe<Scalars['Int']['output']>;
  min?: Maybe<Scalars['Int']['output']>;
  sum?: Maybe<Scalars['Int']['output']>;
};

/** Int filters */
export type IntScalarFilters = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
};

/** Int mutations */
export type IntScalarMutations = {
  add?: InputMaybe<Scalars['Int']['input']>;
  set?: InputMaybe<Scalars['Int']['input']>;
  subtract?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPeople: CreatePeopleMutationResponse;
  deletePeople: DeleteInfo;
  updatePeople: UpdatePeopleMutationResponse;
};


export type MutationCreatePeopleArgs = {
  input: Array<PersonCreateInput>;
};


export type MutationDeletePeopleArgs = {
  delete?: InputMaybe<PersonDeleteInput>;
  where?: InputMaybe<PersonWhere>;
};


export type MutationUpdatePeopleArgs = {
  update?: InputMaybe<PersonUpdateInput>;
  where?: InputMaybe<PersonWhere>;
};

/** Pagination information (Relay) */
export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PeopleConnection = {
  __typename?: 'PeopleConnection';
  aggregate: PersonAggregate;
  edges: Array<PersonEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type Person = {
  __typename?: 'Person';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  relationships: Array<Person>;
  relationshipsConnection: PersonRelationshipsConnection;
};


export type PersonRelationshipsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PersonSort>>;
  where?: InputMaybe<PersonWhere>;
};


export type PersonRelationshipsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PersonRelationshipsConnectionSort>>;
  where?: InputMaybe<PersonRelationshipsConnectionWhere>;
};

export type PersonAggregate = {
  __typename?: 'PersonAggregate';
  count: Count;
  node: PersonAggregateNode;
};

export type PersonAggregateNode = {
  __typename?: 'PersonAggregateNode';
  email: StringAggregateSelection;
  name: StringAggregateSelection;
  nickname: StringAggregateSelection;
  photoUrl: StringAggregateSelection;
};

export type PersonConnectInput = {
  relationships?: InputMaybe<Array<PersonRelationshipsConnectFieldInput>>;
};

export type PersonConnectWhere = {
  node: PersonWhere;
};

export type PersonCreateInput = {
  email: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  nickname?: InputMaybe<Scalars['String']['input']>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  relationships?: InputMaybe<PersonRelationshipsFieldInput>;
};

export type PersonDeleteInput = {
  relationships?: InputMaybe<Array<PersonRelationshipsDeleteFieldInput>>;
};

export type PersonDisconnectInput = {
  relationships?: InputMaybe<Array<PersonRelationshipsDisconnectFieldInput>>;
};

export type PersonEdge = {
  __typename?: 'PersonEdge';
  cursor: Scalars['String']['output'];
  node: Person;
};

export type PersonPersonRelationshipsAggregateSelection = {
  __typename?: 'PersonPersonRelationshipsAggregateSelection';
  count: CountConnection;
  edge?: Maybe<PersonPersonRelationshipsEdgeAggregateSelection>;
  node?: Maybe<PersonPersonRelationshipsNodeAggregateSelection>;
};

export type PersonPersonRelationshipsEdgeAggregateSelection = {
  __typename?: 'PersonPersonRelationshipsEdgeAggregateSelection';
  frecuency: IntAggregateSelection;
  importance: IntAggregateSelection;
};

export type PersonPersonRelationshipsNodeAggregateSelection = {
  __typename?: 'PersonPersonRelationshipsNodeAggregateSelection';
  email: StringAggregateSelection;
  name: StringAggregateSelection;
  nickname: StringAggregateSelection;
  photoUrl: StringAggregateSelection;
};

export type PersonRelationshipsConnectFieldInput = {
  connect?: InputMaybe<Array<PersonConnectInput>>;
  edge: RelationshipPropertiesCreateInput;
  where?: InputMaybe<PersonConnectWhere>;
};

export type PersonRelationshipsConnection = {
  __typename?: 'PersonRelationshipsConnection';
  aggregate: PersonPersonRelationshipsAggregateSelection;
  edges: Array<PersonRelationshipsRelationship>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PersonRelationshipsConnectionSort = {
  edge?: InputMaybe<RelationshipPropertiesSort>;
  node?: InputMaybe<PersonSort>;
};

export type PersonRelationshipsConnectionWhere = {
  AND?: InputMaybe<Array<PersonRelationshipsConnectionWhere>>;
  NOT?: InputMaybe<PersonRelationshipsConnectionWhere>;
  OR?: InputMaybe<Array<PersonRelationshipsConnectionWhere>>;
  edge?: InputMaybe<RelationshipPropertiesWhere>;
  node?: InputMaybe<PersonWhere>;
};

export type PersonRelationshipsCreateFieldInput = {
  edge: RelationshipPropertiesCreateInput;
  node: PersonCreateInput;
};

export type PersonRelationshipsDeleteFieldInput = {
  delete?: InputMaybe<PersonDeleteInput>;
  where?: InputMaybe<PersonRelationshipsConnectionWhere>;
};

export type PersonRelationshipsDisconnectFieldInput = {
  disconnect?: InputMaybe<PersonDisconnectInput>;
  where?: InputMaybe<PersonRelationshipsConnectionWhere>;
};

export type PersonRelationshipsFieldInput = {
  connect?: InputMaybe<Array<PersonRelationshipsConnectFieldInput>>;
  create?: InputMaybe<Array<PersonRelationshipsCreateFieldInput>>;
};

export type PersonRelationshipsRelationship = {
  __typename?: 'PersonRelationshipsRelationship';
  cursor: Scalars['String']['output'];
  node: Person;
  properties: RelationshipProperties;
};

export type PersonRelationshipsUpdateConnectionInput = {
  edge?: InputMaybe<RelationshipPropertiesUpdateInput>;
  node?: InputMaybe<PersonUpdateInput>;
  where?: InputMaybe<PersonRelationshipsConnectionWhere>;
};

export type PersonRelationshipsUpdateFieldInput = {
  connect?: InputMaybe<Array<PersonRelationshipsConnectFieldInput>>;
  create?: InputMaybe<Array<PersonRelationshipsCreateFieldInput>>;
  delete?: InputMaybe<Array<PersonRelationshipsDeleteFieldInput>>;
  disconnect?: InputMaybe<Array<PersonRelationshipsDisconnectFieldInput>>;
  update?: InputMaybe<PersonRelationshipsUpdateConnectionInput>;
};

/** Fields to sort People by. The order in which sorts are applied is not guaranteed when specifying many fields in one PersonSort object. */
export type PersonSort = {
  email?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  nickname?: InputMaybe<SortDirection>;
  photoUrl?: InputMaybe<SortDirection>;
};

export type PersonUpdateInput = {
  email?: InputMaybe<StringScalarMutations>;
  id?: InputMaybe<IdScalarMutations>;
  name?: InputMaybe<StringScalarMutations>;
  nickname?: InputMaybe<StringScalarMutations>;
  photoUrl?: InputMaybe<StringScalarMutations>;
  relationships?: InputMaybe<Array<PersonRelationshipsUpdateFieldInput>>;
};

export type PersonWhere = {
  AND?: InputMaybe<Array<PersonWhere>>;
  NOT?: InputMaybe<PersonWhere>;
  OR?: InputMaybe<Array<PersonWhere>>;
  email?: InputMaybe<StringScalarFilters>;
  id?: InputMaybe<IdScalarFilters>;
  name?: InputMaybe<StringScalarFilters>;
  nickname?: InputMaybe<StringScalarFilters>;
  photoUrl?: InputMaybe<StringScalarFilters>;
};

export type Query = {
  __typename?: 'Query';
  people: Array<Person>;
  peopleConnection: PeopleConnection;
};


export type QueryPeopleArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PersonSort>>;
  where?: InputMaybe<PersonWhere>;
};


export type QueryPeopleConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Array<PersonSort>>;
  where?: InputMaybe<PersonWhere>;
};

/**
 * The edge properties for the following fields:
 * * Person.relationships
 */
export type RelationshipProperties = {
  __typename?: 'RelationshipProperties';
  frecuency: Scalars['Int']['output'];
  importance: Scalars['Int']['output'];
  status: RelationshipStatus;
};

export type RelationshipPropertiesCreateInput = {
  frecuency: Scalars['Int']['input'];
  importance: Scalars['Int']['input'];
  status: RelationshipStatus;
};

export type RelationshipPropertiesSort = {
  frecuency?: InputMaybe<SortDirection>;
  importance?: InputMaybe<SortDirection>;
  status?: InputMaybe<SortDirection>;
};

export type RelationshipPropertiesUpdateInput = {
  frecuency?: InputMaybe<IntScalarMutations>;
  importance?: InputMaybe<IntScalarMutations>;
  status?: InputMaybe<RelationshipStatusEnumScalarMutations>;
};

export type RelationshipPropertiesWhere = {
  AND?: InputMaybe<Array<RelationshipPropertiesWhere>>;
  NOT?: InputMaybe<RelationshipPropertiesWhere>;
  OR?: InputMaybe<Array<RelationshipPropertiesWhere>>;
  frecuency?: InputMaybe<IntScalarFilters>;
  importance?: InputMaybe<IntScalarFilters>;
  status?: InputMaybe<RelationshipStatusEnumScalarFilters>;
};

export type RelationshipStatus =
  | 'COLLEAGUE'
  | 'FAMILY'
  | 'FRIEND';

/** RelationshipStatus filters */
export type RelationshipStatusEnumScalarFilters = {
  eq?: InputMaybe<RelationshipStatus>;
  in?: InputMaybe<Array<RelationshipStatus>>;
};

/** RelationshipStatus mutations */
export type RelationshipStatusEnumScalarMutations = {
  set?: InputMaybe<RelationshipStatus>;
};

/** An enum for sorting in either ascending or descending order. */
export type SortDirection =
  /** Sort by field values in ascending order. */
  | 'ASC'
  /** Sort by field values in descending order. */
  | 'DESC';

export type StringAggregateSelection = {
  __typename?: 'StringAggregateSelection';
  longest?: Maybe<Scalars['String']['output']>;
  shortest?: Maybe<Scalars['String']['output']>;
};

/** String filters */
export type StringScalarFilters = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** String mutations */
export type StringScalarMutations = {
  set?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the number of nodes and relationships created and deleted during an update mutation */
export type UpdateInfo = {
  __typename?: 'UpdateInfo';
  nodesCreated: Scalars['Int']['output'];
  nodesDeleted: Scalars['Int']['output'];
  relationshipsCreated: Scalars['Int']['output'];
  relationshipsDeleted: Scalars['Int']['output'];
};

export type UpdatePeopleMutationResponse = {
  __typename?: 'UpdatePeopleMutationResponse';
  info: UpdateInfo;
  people: Array<Person>;
};

export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


export type Unnamed_1_Query = { __typename?: 'Query', people: Array<{ __typename?: 'Person', id: string, name: string, nickname?: string | null, email: string, photoUrl?: string | null, relationshipsConnection: { __typename?: 'PersonRelationshipsConnection', totalCount: number, edges: Array<{ __typename?: 'PersonRelationshipsRelationship', node: { __typename?: 'Person', id: string }, properties: { __typename?: 'RelationshipProperties', status: RelationshipStatus, importance: number, frecuency: number } }> } }> };
