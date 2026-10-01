
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CbtUser
 * 
 */
export type CbtUser = $Result.DefaultSelection<Prisma.$CbtUserPayload>
/**
 * Model CbtClass
 * 
 */
export type CbtClass = $Result.DefaultSelection<Prisma.$CbtClassPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CbtUsers
 * const cbtUsers = await prisma.cbtUser.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CbtUsers
   * const cbtUsers = await prisma.cbtUser.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.cbtUser`: Exposes CRUD operations for the **CbtUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CbtUsers
    * const cbtUsers = await prisma.cbtUser.findMany()
    * ```
    */
  get cbtUser(): Prisma.CbtUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cbtClass`: Exposes CRUD operations for the **CbtClass** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CbtClasses
    * const cbtClasses = await prisma.cbtClass.findMany()
    * ```
    */
  get cbtClass(): Prisma.CbtClassDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CbtUser: 'CbtUser',
    CbtClass: 'CbtClass'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "cbtUser" | "cbtClass"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CbtUser: {
        payload: Prisma.$CbtUserPayload<ExtArgs>
        fields: Prisma.CbtUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CbtUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CbtUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          findFirst: {
            args: Prisma.CbtUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CbtUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          findMany: {
            args: Prisma.CbtUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>[]
          }
          create: {
            args: Prisma.CbtUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          createMany: {
            args: Prisma.CbtUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CbtUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          update: {
            args: Prisma.CbtUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          deleteMany: {
            args: Prisma.CbtUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CbtUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CbtUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtUserPayload>
          }
          aggregate: {
            args: Prisma.CbtUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCbtUser>
          }
          groupBy: {
            args: Prisma.CbtUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<CbtUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.CbtUserCountArgs<ExtArgs>
            result: $Utils.Optional<CbtUserCountAggregateOutputType> | number
          }
        }
      }
      CbtClass: {
        payload: Prisma.$CbtClassPayload<ExtArgs>
        fields: Prisma.CbtClassFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CbtClassFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CbtClassFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          findFirst: {
            args: Prisma.CbtClassFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CbtClassFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          findMany: {
            args: Prisma.CbtClassFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>[]
          }
          create: {
            args: Prisma.CbtClassCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          createMany: {
            args: Prisma.CbtClassCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CbtClassDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          update: {
            args: Prisma.CbtClassUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          deleteMany: {
            args: Prisma.CbtClassDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CbtClassUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CbtClassUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CbtClassPayload>
          }
          aggregate: {
            args: Prisma.CbtClassAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCbtClass>
          }
          groupBy: {
            args: Prisma.CbtClassGroupByArgs<ExtArgs>
            result: $Utils.Optional<CbtClassGroupByOutputType>[]
          }
          count: {
            args: Prisma.CbtClassCountArgs<ExtArgs>
            result: $Utils.Optional<CbtClassCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    cbtUser?: CbtUserOmit
    cbtClass?: CbtClassOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model CbtUser
   */

  export type AggregateCbtUser = {
    _count: CbtUserCountAggregateOutputType | null
    _avg: CbtUserAvgAggregateOutputType | null
    _sum: CbtUserSumAggregateOutputType | null
    _min: CbtUserMinAggregateOutputType | null
    _max: CbtUserMaxAggregateOutputType | null
  }

  export type CbtUserAvgAggregateOutputType = {
    id: number | null
    classId: number | null
  }

  export type CbtUserSumAggregateOutputType = {
    id: bigint | null
    classId: bigint | null
  }

  export type CbtUserMinAggregateOutputType = {
    id: bigint | null
    username: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    classId: bigint | null
    nisn: string | null
    phone: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type CbtUserMaxAggregateOutputType = {
    id: bigint | null
    username: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    classId: bigint | null
    nisn: string | null
    phone: string | null
    isActive: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
  }

  export type CbtUserCountAggregateOutputType = {
    id: number
    username: number
    name: number
    email: number
    password: number
    role: number
    classId: number
    nisn: number
    phone: number
    isActive: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    deletedAt: number
    _all: number
  }


  export type CbtUserAvgAggregateInputType = {
    id?: true
    classId?: true
  }

  export type CbtUserSumAggregateInputType = {
    id?: true
    classId?: true
  }

  export type CbtUserMinAggregateInputType = {
    id?: true
    username?: true
    name?: true
    email?: true
    password?: true
    role?: true
    classId?: true
    nisn?: true
    phone?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type CbtUserMaxAggregateInputType = {
    id?: true
    username?: true
    name?: true
    email?: true
    password?: true
    role?: true
    classId?: true
    nisn?: true
    phone?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
  }

  export type CbtUserCountAggregateInputType = {
    id?: true
    username?: true
    name?: true
    email?: true
    password?: true
    role?: true
    classId?: true
    nisn?: true
    phone?: true
    isActive?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    deletedAt?: true
    _all?: true
  }

  export type CbtUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CbtUser to aggregate.
     */
    where?: CbtUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtUsers to fetch.
     */
    orderBy?: CbtUserOrderByWithRelationInput | CbtUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CbtUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CbtUsers
    **/
    _count?: true | CbtUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CbtUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CbtUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CbtUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CbtUserMaxAggregateInputType
  }

  export type GetCbtUserAggregateType<T extends CbtUserAggregateArgs> = {
        [P in keyof T & keyof AggregateCbtUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCbtUser[P]>
      : GetScalarType<T[P], AggregateCbtUser[P]>
  }




  export type CbtUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CbtUserWhereInput
    orderBy?: CbtUserOrderByWithAggregationInput | CbtUserOrderByWithAggregationInput[]
    by: CbtUserScalarFieldEnum[] | CbtUserScalarFieldEnum
    having?: CbtUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CbtUserCountAggregateInputType | true
    _avg?: CbtUserAvgAggregateInputType
    _sum?: CbtUserSumAggregateInputType
    _min?: CbtUserMinAggregateInputType
    _max?: CbtUserMaxAggregateInputType
  }

  export type CbtUserGroupByOutputType = {
    id: bigint
    username: string
    name: string
    email: string | null
    password: string
    role: string
    classId: bigint | null
    nisn: string | null
    phone: string | null
    isActive: boolean
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
    deletedAt: Date | null
    _count: CbtUserCountAggregateOutputType | null
    _avg: CbtUserAvgAggregateOutputType | null
    _sum: CbtUserSumAggregateOutputType | null
    _min: CbtUserMinAggregateOutputType | null
    _max: CbtUserMaxAggregateOutputType | null
  }

  type GetCbtUserGroupByPayload<T extends CbtUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CbtUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CbtUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CbtUserGroupByOutputType[P]>
            : GetScalarType<T[P], CbtUserGroupByOutputType[P]>
        }
      >
    >


  export type CbtUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    classId?: boolean
    nisn?: boolean
    phone?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }, ExtArgs["result"]["cbtUser"]>



  export type CbtUserSelectScalar = {
    id?: boolean
    username?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    classId?: boolean
    nisn?: boolean
    phone?: boolean
    isActive?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    deletedAt?: boolean
  }

  export type CbtUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "name" | "email" | "password" | "role" | "classId" | "nisn" | "phone" | "isActive" | "lastLoginAt" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["cbtUser"]>

  export type $CbtUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CbtUser"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      username: string
      name: string
      email: string | null
      password: string
      role: string
      classId: bigint | null
      nisn: string | null
      phone: string | null
      isActive: boolean
      lastLoginAt: Date | null
      createdAt: Date | null
      updatedAt: Date | null
      deletedAt: Date | null
    }, ExtArgs["result"]["cbtUser"]>
    composites: {}
  }

  type CbtUserGetPayload<S extends boolean | null | undefined | CbtUserDefaultArgs> = $Result.GetResult<Prisma.$CbtUserPayload, S>

  type CbtUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CbtUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CbtUserCountAggregateInputType | true
    }

  export interface CbtUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CbtUser'], meta: { name: 'CbtUser' } }
    /**
     * Find zero or one CbtUser that matches the filter.
     * @param {CbtUserFindUniqueArgs} args - Arguments to find a CbtUser
     * @example
     * // Get one CbtUser
     * const cbtUser = await prisma.cbtUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CbtUserFindUniqueArgs>(args: SelectSubset<T, CbtUserFindUniqueArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CbtUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CbtUserFindUniqueOrThrowArgs} args - Arguments to find a CbtUser
     * @example
     * // Get one CbtUser
     * const cbtUser = await prisma.cbtUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CbtUserFindUniqueOrThrowArgs>(args: SelectSubset<T, CbtUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CbtUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserFindFirstArgs} args - Arguments to find a CbtUser
     * @example
     * // Get one CbtUser
     * const cbtUser = await prisma.cbtUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CbtUserFindFirstArgs>(args?: SelectSubset<T, CbtUserFindFirstArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CbtUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserFindFirstOrThrowArgs} args - Arguments to find a CbtUser
     * @example
     * // Get one CbtUser
     * const cbtUser = await prisma.cbtUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CbtUserFindFirstOrThrowArgs>(args?: SelectSubset<T, CbtUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CbtUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CbtUsers
     * const cbtUsers = await prisma.cbtUser.findMany()
     * 
     * // Get first 10 CbtUsers
     * const cbtUsers = await prisma.cbtUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cbtUserWithIdOnly = await prisma.cbtUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CbtUserFindManyArgs>(args?: SelectSubset<T, CbtUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CbtUser.
     * @param {CbtUserCreateArgs} args - Arguments to create a CbtUser.
     * @example
     * // Create one CbtUser
     * const CbtUser = await prisma.cbtUser.create({
     *   data: {
     *     // ... data to create a CbtUser
     *   }
     * })
     * 
     */
    create<T extends CbtUserCreateArgs>(args: SelectSubset<T, CbtUserCreateArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CbtUsers.
     * @param {CbtUserCreateManyArgs} args - Arguments to create many CbtUsers.
     * @example
     * // Create many CbtUsers
     * const cbtUser = await prisma.cbtUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CbtUserCreateManyArgs>(args?: SelectSubset<T, CbtUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CbtUser.
     * @param {CbtUserDeleteArgs} args - Arguments to delete one CbtUser.
     * @example
     * // Delete one CbtUser
     * const CbtUser = await prisma.cbtUser.delete({
     *   where: {
     *     // ... filter to delete one CbtUser
     *   }
     * })
     * 
     */
    delete<T extends CbtUserDeleteArgs>(args: SelectSubset<T, CbtUserDeleteArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CbtUser.
     * @param {CbtUserUpdateArgs} args - Arguments to update one CbtUser.
     * @example
     * // Update one CbtUser
     * const cbtUser = await prisma.cbtUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CbtUserUpdateArgs>(args: SelectSubset<T, CbtUserUpdateArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CbtUsers.
     * @param {CbtUserDeleteManyArgs} args - Arguments to filter CbtUsers to delete.
     * @example
     * // Delete a few CbtUsers
     * const { count } = await prisma.cbtUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CbtUserDeleteManyArgs>(args?: SelectSubset<T, CbtUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CbtUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CbtUsers
     * const cbtUser = await prisma.cbtUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CbtUserUpdateManyArgs>(args: SelectSubset<T, CbtUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CbtUser.
     * @param {CbtUserUpsertArgs} args - Arguments to update or create a CbtUser.
     * @example
     * // Update or create a CbtUser
     * const cbtUser = await prisma.cbtUser.upsert({
     *   create: {
     *     // ... data to create a CbtUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CbtUser we want to update
     *   }
     * })
     */
    upsert<T extends CbtUserUpsertArgs>(args: SelectSubset<T, CbtUserUpsertArgs<ExtArgs>>): Prisma__CbtUserClient<$Result.GetResult<Prisma.$CbtUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CbtUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserCountArgs} args - Arguments to filter CbtUsers to count.
     * @example
     * // Count the number of CbtUsers
     * const count = await prisma.cbtUser.count({
     *   where: {
     *     // ... the filter for the CbtUsers we want to count
     *   }
     * })
    **/
    count<T extends CbtUserCountArgs>(
      args?: Subset<T, CbtUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CbtUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CbtUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CbtUserAggregateArgs>(args: Subset<T, CbtUserAggregateArgs>): Prisma.PrismaPromise<GetCbtUserAggregateType<T>>

    /**
     * Group by CbtUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CbtUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CbtUserGroupByArgs['orderBy'] }
        : { orderBy?: CbtUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CbtUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCbtUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CbtUser model
   */
  readonly fields: CbtUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CbtUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CbtUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CbtUser model
   */
  interface CbtUserFieldRefs {
    readonly id: FieldRef<"CbtUser", 'BigInt'>
    readonly username: FieldRef<"CbtUser", 'String'>
    readonly name: FieldRef<"CbtUser", 'String'>
    readonly email: FieldRef<"CbtUser", 'String'>
    readonly password: FieldRef<"CbtUser", 'String'>
    readonly role: FieldRef<"CbtUser", 'String'>
    readonly classId: FieldRef<"CbtUser", 'BigInt'>
    readonly nisn: FieldRef<"CbtUser", 'String'>
    readonly phone: FieldRef<"CbtUser", 'String'>
    readonly isActive: FieldRef<"CbtUser", 'Boolean'>
    readonly lastLoginAt: FieldRef<"CbtUser", 'DateTime'>
    readonly createdAt: FieldRef<"CbtUser", 'DateTime'>
    readonly updatedAt: FieldRef<"CbtUser", 'DateTime'>
    readonly deletedAt: FieldRef<"CbtUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CbtUser findUnique
   */
  export type CbtUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter, which CbtUser to fetch.
     */
    where: CbtUserWhereUniqueInput
  }

  /**
   * CbtUser findUniqueOrThrow
   */
  export type CbtUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter, which CbtUser to fetch.
     */
    where: CbtUserWhereUniqueInput
  }

  /**
   * CbtUser findFirst
   */
  export type CbtUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter, which CbtUser to fetch.
     */
    where?: CbtUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtUsers to fetch.
     */
    orderBy?: CbtUserOrderByWithRelationInput | CbtUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CbtUsers.
     */
    cursor?: CbtUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CbtUsers.
     */
    distinct?: CbtUserScalarFieldEnum | CbtUserScalarFieldEnum[]
  }

  /**
   * CbtUser findFirstOrThrow
   */
  export type CbtUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter, which CbtUser to fetch.
     */
    where?: CbtUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtUsers to fetch.
     */
    orderBy?: CbtUserOrderByWithRelationInput | CbtUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CbtUsers.
     */
    cursor?: CbtUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CbtUsers.
     */
    distinct?: CbtUserScalarFieldEnum | CbtUserScalarFieldEnum[]
  }

  /**
   * CbtUser findMany
   */
  export type CbtUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter, which CbtUsers to fetch.
     */
    where?: CbtUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtUsers to fetch.
     */
    orderBy?: CbtUserOrderByWithRelationInput | CbtUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CbtUsers.
     */
    cursor?: CbtUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtUsers.
     */
    skip?: number
    distinct?: CbtUserScalarFieldEnum | CbtUserScalarFieldEnum[]
  }

  /**
   * CbtUser create
   */
  export type CbtUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * The data needed to create a CbtUser.
     */
    data: XOR<CbtUserCreateInput, CbtUserUncheckedCreateInput>
  }

  /**
   * CbtUser createMany
   */
  export type CbtUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CbtUsers.
     */
    data: CbtUserCreateManyInput | CbtUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CbtUser update
   */
  export type CbtUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * The data needed to update a CbtUser.
     */
    data: XOR<CbtUserUpdateInput, CbtUserUncheckedUpdateInput>
    /**
     * Choose, which CbtUser to update.
     */
    where: CbtUserWhereUniqueInput
  }

  /**
   * CbtUser updateMany
   */
  export type CbtUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CbtUsers.
     */
    data: XOR<CbtUserUpdateManyMutationInput, CbtUserUncheckedUpdateManyInput>
    /**
     * Filter which CbtUsers to update
     */
    where?: CbtUserWhereInput
    /**
     * Limit how many CbtUsers to update.
     */
    limit?: number
  }

  /**
   * CbtUser upsert
   */
  export type CbtUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * The filter to search for the CbtUser to update in case it exists.
     */
    where: CbtUserWhereUniqueInput
    /**
     * In case the CbtUser found by the `where` argument doesn't exist, create a new CbtUser with this data.
     */
    create: XOR<CbtUserCreateInput, CbtUserUncheckedCreateInput>
    /**
     * In case the CbtUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CbtUserUpdateInput, CbtUserUncheckedUpdateInput>
  }

  /**
   * CbtUser delete
   */
  export type CbtUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
    /**
     * Filter which CbtUser to delete.
     */
    where: CbtUserWhereUniqueInput
  }

  /**
   * CbtUser deleteMany
   */
  export type CbtUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CbtUsers to delete
     */
    where?: CbtUserWhereInput
    /**
     * Limit how many CbtUsers to delete.
     */
    limit?: number
  }

  /**
   * CbtUser without action
   */
  export type CbtUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtUser
     */
    select?: CbtUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtUser
     */
    omit?: CbtUserOmit<ExtArgs> | null
  }


  /**
   * Model CbtClass
   */

  export type AggregateCbtClass = {
    _count: CbtClassCountAggregateOutputType | null
    _avg: CbtClassAvgAggregateOutputType | null
    _sum: CbtClassSumAggregateOutputType | null
    _min: CbtClassMinAggregateOutputType | null
    _max: CbtClassMaxAggregateOutputType | null
  }

  export type CbtClassAvgAggregateOutputType = {
    id: number | null
  }

  export type CbtClassSumAggregateOutputType = {
    id: bigint | null
  }

  export type CbtClassMinAggregateOutputType = {
    id: bigint | null
    name: string | null
    grade: string | null
    academicYear: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CbtClassMaxAggregateOutputType = {
    id: bigint | null
    name: string | null
    grade: string | null
    academicYear: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CbtClassCountAggregateOutputType = {
    id: number
    name: number
    grade: number
    academicYear: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CbtClassAvgAggregateInputType = {
    id?: true
  }

  export type CbtClassSumAggregateInputType = {
    id?: true
  }

  export type CbtClassMinAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    academicYear?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CbtClassMaxAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    academicYear?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CbtClassCountAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    academicYear?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CbtClassAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CbtClass to aggregate.
     */
    where?: CbtClassWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtClasses to fetch.
     */
    orderBy?: CbtClassOrderByWithRelationInput | CbtClassOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CbtClassWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtClasses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtClasses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CbtClasses
    **/
    _count?: true | CbtClassCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CbtClassAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CbtClassSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CbtClassMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CbtClassMaxAggregateInputType
  }

  export type GetCbtClassAggregateType<T extends CbtClassAggregateArgs> = {
        [P in keyof T & keyof AggregateCbtClass]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCbtClass[P]>
      : GetScalarType<T[P], AggregateCbtClass[P]>
  }




  export type CbtClassGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CbtClassWhereInput
    orderBy?: CbtClassOrderByWithAggregationInput | CbtClassOrderByWithAggregationInput[]
    by: CbtClassScalarFieldEnum[] | CbtClassScalarFieldEnum
    having?: CbtClassScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CbtClassCountAggregateInputType | true
    _avg?: CbtClassAvgAggregateInputType
    _sum?: CbtClassSumAggregateInputType
    _min?: CbtClassMinAggregateInputType
    _max?: CbtClassMaxAggregateInputType
  }

  export type CbtClassGroupByOutputType = {
    id: bigint
    name: string
    grade: string | null
    academicYear: string | null
    isActive: boolean
    createdAt: Date | null
    updatedAt: Date | null
    _count: CbtClassCountAggregateOutputType | null
    _avg: CbtClassAvgAggregateOutputType | null
    _sum: CbtClassSumAggregateOutputType | null
    _min: CbtClassMinAggregateOutputType | null
    _max: CbtClassMaxAggregateOutputType | null
  }

  type GetCbtClassGroupByPayload<T extends CbtClassGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CbtClassGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CbtClassGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CbtClassGroupByOutputType[P]>
            : GetScalarType<T[P], CbtClassGroupByOutputType[P]>
        }
      >
    >


  export type CbtClassSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    grade?: boolean
    academicYear?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cbtClass"]>



  export type CbtClassSelectScalar = {
    id?: boolean
    name?: boolean
    grade?: boolean
    academicYear?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CbtClassOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "grade" | "academicYear" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["cbtClass"]>

  export type $CbtClassPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CbtClass"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      name: string
      grade: string | null
      academicYear: string | null
      isActive: boolean
      createdAt: Date | null
      updatedAt: Date | null
    }, ExtArgs["result"]["cbtClass"]>
    composites: {}
  }

  type CbtClassGetPayload<S extends boolean | null | undefined | CbtClassDefaultArgs> = $Result.GetResult<Prisma.$CbtClassPayload, S>

  type CbtClassCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CbtClassFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CbtClassCountAggregateInputType | true
    }

  export interface CbtClassDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CbtClass'], meta: { name: 'CbtClass' } }
    /**
     * Find zero or one CbtClass that matches the filter.
     * @param {CbtClassFindUniqueArgs} args - Arguments to find a CbtClass
     * @example
     * // Get one CbtClass
     * const cbtClass = await prisma.cbtClass.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CbtClassFindUniqueArgs>(args: SelectSubset<T, CbtClassFindUniqueArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CbtClass that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CbtClassFindUniqueOrThrowArgs} args - Arguments to find a CbtClass
     * @example
     * // Get one CbtClass
     * const cbtClass = await prisma.cbtClass.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CbtClassFindUniqueOrThrowArgs>(args: SelectSubset<T, CbtClassFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CbtClass that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassFindFirstArgs} args - Arguments to find a CbtClass
     * @example
     * // Get one CbtClass
     * const cbtClass = await prisma.cbtClass.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CbtClassFindFirstArgs>(args?: SelectSubset<T, CbtClassFindFirstArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CbtClass that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassFindFirstOrThrowArgs} args - Arguments to find a CbtClass
     * @example
     * // Get one CbtClass
     * const cbtClass = await prisma.cbtClass.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CbtClassFindFirstOrThrowArgs>(args?: SelectSubset<T, CbtClassFindFirstOrThrowArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CbtClasses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CbtClasses
     * const cbtClasses = await prisma.cbtClass.findMany()
     * 
     * // Get first 10 CbtClasses
     * const cbtClasses = await prisma.cbtClass.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cbtClassWithIdOnly = await prisma.cbtClass.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CbtClassFindManyArgs>(args?: SelectSubset<T, CbtClassFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CbtClass.
     * @param {CbtClassCreateArgs} args - Arguments to create a CbtClass.
     * @example
     * // Create one CbtClass
     * const CbtClass = await prisma.cbtClass.create({
     *   data: {
     *     // ... data to create a CbtClass
     *   }
     * })
     * 
     */
    create<T extends CbtClassCreateArgs>(args: SelectSubset<T, CbtClassCreateArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CbtClasses.
     * @param {CbtClassCreateManyArgs} args - Arguments to create many CbtClasses.
     * @example
     * // Create many CbtClasses
     * const cbtClass = await prisma.cbtClass.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CbtClassCreateManyArgs>(args?: SelectSubset<T, CbtClassCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CbtClass.
     * @param {CbtClassDeleteArgs} args - Arguments to delete one CbtClass.
     * @example
     * // Delete one CbtClass
     * const CbtClass = await prisma.cbtClass.delete({
     *   where: {
     *     // ... filter to delete one CbtClass
     *   }
     * })
     * 
     */
    delete<T extends CbtClassDeleteArgs>(args: SelectSubset<T, CbtClassDeleteArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CbtClass.
     * @param {CbtClassUpdateArgs} args - Arguments to update one CbtClass.
     * @example
     * // Update one CbtClass
     * const cbtClass = await prisma.cbtClass.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CbtClassUpdateArgs>(args: SelectSubset<T, CbtClassUpdateArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CbtClasses.
     * @param {CbtClassDeleteManyArgs} args - Arguments to filter CbtClasses to delete.
     * @example
     * // Delete a few CbtClasses
     * const { count } = await prisma.cbtClass.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CbtClassDeleteManyArgs>(args?: SelectSubset<T, CbtClassDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CbtClasses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CbtClasses
     * const cbtClass = await prisma.cbtClass.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CbtClassUpdateManyArgs>(args: SelectSubset<T, CbtClassUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CbtClass.
     * @param {CbtClassUpsertArgs} args - Arguments to update or create a CbtClass.
     * @example
     * // Update or create a CbtClass
     * const cbtClass = await prisma.cbtClass.upsert({
     *   create: {
     *     // ... data to create a CbtClass
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CbtClass we want to update
     *   }
     * })
     */
    upsert<T extends CbtClassUpsertArgs>(args: SelectSubset<T, CbtClassUpsertArgs<ExtArgs>>): Prisma__CbtClassClient<$Result.GetResult<Prisma.$CbtClassPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CbtClasses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassCountArgs} args - Arguments to filter CbtClasses to count.
     * @example
     * // Count the number of CbtClasses
     * const count = await prisma.cbtClass.count({
     *   where: {
     *     // ... the filter for the CbtClasses we want to count
     *   }
     * })
    **/
    count<T extends CbtClassCountArgs>(
      args?: Subset<T, CbtClassCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CbtClassCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CbtClass.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CbtClassAggregateArgs>(args: Subset<T, CbtClassAggregateArgs>): Prisma.PrismaPromise<GetCbtClassAggregateType<T>>

    /**
     * Group by CbtClass.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CbtClassGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CbtClassGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CbtClassGroupByArgs['orderBy'] }
        : { orderBy?: CbtClassGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CbtClassGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCbtClassGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CbtClass model
   */
  readonly fields: CbtClassFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CbtClass.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CbtClassClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CbtClass model
   */
  interface CbtClassFieldRefs {
    readonly id: FieldRef<"CbtClass", 'BigInt'>
    readonly name: FieldRef<"CbtClass", 'String'>
    readonly grade: FieldRef<"CbtClass", 'String'>
    readonly academicYear: FieldRef<"CbtClass", 'String'>
    readonly isActive: FieldRef<"CbtClass", 'Boolean'>
    readonly createdAt: FieldRef<"CbtClass", 'DateTime'>
    readonly updatedAt: FieldRef<"CbtClass", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CbtClass findUnique
   */
  export type CbtClassFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter, which CbtClass to fetch.
     */
    where: CbtClassWhereUniqueInput
  }

  /**
   * CbtClass findUniqueOrThrow
   */
  export type CbtClassFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter, which CbtClass to fetch.
     */
    where: CbtClassWhereUniqueInput
  }

  /**
   * CbtClass findFirst
   */
  export type CbtClassFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter, which CbtClass to fetch.
     */
    where?: CbtClassWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtClasses to fetch.
     */
    orderBy?: CbtClassOrderByWithRelationInput | CbtClassOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CbtClasses.
     */
    cursor?: CbtClassWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtClasses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtClasses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CbtClasses.
     */
    distinct?: CbtClassScalarFieldEnum | CbtClassScalarFieldEnum[]
  }

  /**
   * CbtClass findFirstOrThrow
   */
  export type CbtClassFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter, which CbtClass to fetch.
     */
    where?: CbtClassWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtClasses to fetch.
     */
    orderBy?: CbtClassOrderByWithRelationInput | CbtClassOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CbtClasses.
     */
    cursor?: CbtClassWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtClasses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtClasses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CbtClasses.
     */
    distinct?: CbtClassScalarFieldEnum | CbtClassScalarFieldEnum[]
  }

  /**
   * CbtClass findMany
   */
  export type CbtClassFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter, which CbtClasses to fetch.
     */
    where?: CbtClassWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CbtClasses to fetch.
     */
    orderBy?: CbtClassOrderByWithRelationInput | CbtClassOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CbtClasses.
     */
    cursor?: CbtClassWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CbtClasses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CbtClasses.
     */
    skip?: number
    distinct?: CbtClassScalarFieldEnum | CbtClassScalarFieldEnum[]
  }

  /**
   * CbtClass create
   */
  export type CbtClassCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * The data needed to create a CbtClass.
     */
    data: XOR<CbtClassCreateInput, CbtClassUncheckedCreateInput>
  }

  /**
   * CbtClass createMany
   */
  export type CbtClassCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CbtClasses.
     */
    data: CbtClassCreateManyInput | CbtClassCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CbtClass update
   */
  export type CbtClassUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * The data needed to update a CbtClass.
     */
    data: XOR<CbtClassUpdateInput, CbtClassUncheckedUpdateInput>
    /**
     * Choose, which CbtClass to update.
     */
    where: CbtClassWhereUniqueInput
  }

  /**
   * CbtClass updateMany
   */
  export type CbtClassUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CbtClasses.
     */
    data: XOR<CbtClassUpdateManyMutationInput, CbtClassUncheckedUpdateManyInput>
    /**
     * Filter which CbtClasses to update
     */
    where?: CbtClassWhereInput
    /**
     * Limit how many CbtClasses to update.
     */
    limit?: number
  }

  /**
   * CbtClass upsert
   */
  export type CbtClassUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * The filter to search for the CbtClass to update in case it exists.
     */
    where: CbtClassWhereUniqueInput
    /**
     * In case the CbtClass found by the `where` argument doesn't exist, create a new CbtClass with this data.
     */
    create: XOR<CbtClassCreateInput, CbtClassUncheckedCreateInput>
    /**
     * In case the CbtClass was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CbtClassUpdateInput, CbtClassUncheckedUpdateInput>
  }

  /**
   * CbtClass delete
   */
  export type CbtClassDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
    /**
     * Filter which CbtClass to delete.
     */
    where: CbtClassWhereUniqueInput
  }

  /**
   * CbtClass deleteMany
   */
  export type CbtClassDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CbtClasses to delete
     */
    where?: CbtClassWhereInput
    /**
     * Limit how many CbtClasses to delete.
     */
    limit?: number
  }

  /**
   * CbtClass without action
   */
  export type CbtClassDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CbtClass
     */
    select?: CbtClassSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CbtClass
     */
    omit?: CbtClassOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CbtUserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    classId: 'classId',
    nisn: 'nisn',
    phone: 'phone',
    isActive: 'isActive',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
  };

  export type CbtUserScalarFieldEnum = (typeof CbtUserScalarFieldEnum)[keyof typeof CbtUserScalarFieldEnum]


  export const CbtClassScalarFieldEnum: {
    id: 'id',
    name: 'name',
    grade: 'grade',
    academicYear: 'academicYear',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CbtClassScalarFieldEnum = (typeof CbtClassScalarFieldEnum)[keyof typeof CbtClassScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const CbtUserOrderByRelevanceFieldEnum: {
    username: 'username',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    nisn: 'nisn',
    phone: 'phone'
  };

  export type CbtUserOrderByRelevanceFieldEnum = (typeof CbtUserOrderByRelevanceFieldEnum)[keyof typeof CbtUserOrderByRelevanceFieldEnum]


  export const CbtClassOrderByRelevanceFieldEnum: {
    name: 'name',
    grade: 'grade',
    academicYear: 'academicYear'
  };

  export type CbtClassOrderByRelevanceFieldEnum = (typeof CbtClassOrderByRelevanceFieldEnum)[keyof typeof CbtClassOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type CbtUserWhereInput = {
    AND?: CbtUserWhereInput | CbtUserWhereInput[]
    OR?: CbtUserWhereInput[]
    NOT?: CbtUserWhereInput | CbtUserWhereInput[]
    id?: BigIntFilter<"CbtUser"> | bigint | number
    username?: StringFilter<"CbtUser"> | string
    name?: StringFilter<"CbtUser"> | string
    email?: StringNullableFilter<"CbtUser"> | string | null
    password?: StringFilter<"CbtUser"> | string
    role?: StringFilter<"CbtUser"> | string
    classId?: BigIntNullableFilter<"CbtUser"> | bigint | number | null
    nisn?: StringNullableFilter<"CbtUser"> | string | null
    phone?: StringNullableFilter<"CbtUser"> | string | null
    isActive?: BoolFilter<"CbtUser"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    deletedAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
  }

  export type CbtUserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    classId?: SortOrderInput | SortOrder
    nisn?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _relevance?: CbtUserOrderByRelevanceInput
  }

  export type CbtUserWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    username?: string
    email?: string
    nisn?: string
    AND?: CbtUserWhereInput | CbtUserWhereInput[]
    OR?: CbtUserWhereInput[]
    NOT?: CbtUserWhereInput | CbtUserWhereInput[]
    name?: StringFilter<"CbtUser"> | string
    password?: StringFilter<"CbtUser"> | string
    role?: StringFilter<"CbtUser"> | string
    classId?: BigIntNullableFilter<"CbtUser"> | bigint | number | null
    phone?: StringNullableFilter<"CbtUser"> | string | null
    isActive?: BoolFilter<"CbtUser"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    createdAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
    deletedAt?: DateTimeNullableFilter<"CbtUser"> | Date | string | null
  }, "id" | "username" | "email" | "nisn">

  export type CbtUserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    classId?: SortOrderInput | SortOrder
    nisn?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    deletedAt?: SortOrderInput | SortOrder
    _count?: CbtUserCountOrderByAggregateInput
    _avg?: CbtUserAvgOrderByAggregateInput
    _max?: CbtUserMaxOrderByAggregateInput
    _min?: CbtUserMinOrderByAggregateInput
    _sum?: CbtUserSumOrderByAggregateInput
  }

  export type CbtUserScalarWhereWithAggregatesInput = {
    AND?: CbtUserScalarWhereWithAggregatesInput | CbtUserScalarWhereWithAggregatesInput[]
    OR?: CbtUserScalarWhereWithAggregatesInput[]
    NOT?: CbtUserScalarWhereWithAggregatesInput | CbtUserScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"CbtUser"> | bigint | number
    username?: StringWithAggregatesFilter<"CbtUser"> | string
    name?: StringWithAggregatesFilter<"CbtUser"> | string
    email?: StringNullableWithAggregatesFilter<"CbtUser"> | string | null
    password?: StringWithAggregatesFilter<"CbtUser"> | string
    role?: StringWithAggregatesFilter<"CbtUser"> | string
    classId?: BigIntNullableWithAggregatesFilter<"CbtUser"> | bigint | number | null
    nisn?: StringNullableWithAggregatesFilter<"CbtUser"> | string | null
    phone?: StringNullableWithAggregatesFilter<"CbtUser"> | string | null
    isActive?: BoolWithAggregatesFilter<"CbtUser"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"CbtUser"> | Date | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"CbtUser"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"CbtUser"> | Date | string | null
    deletedAt?: DateTimeNullableWithAggregatesFilter<"CbtUser"> | Date | string | null
  }

  export type CbtClassWhereInput = {
    AND?: CbtClassWhereInput | CbtClassWhereInput[]
    OR?: CbtClassWhereInput[]
    NOT?: CbtClassWhereInput | CbtClassWhereInput[]
    id?: BigIntFilter<"CbtClass"> | bigint | number
    name?: StringFilter<"CbtClass"> | string
    grade?: StringNullableFilter<"CbtClass"> | string | null
    academicYear?: StringNullableFilter<"CbtClass"> | string | null
    isActive?: BoolFilter<"CbtClass"> | boolean
    createdAt?: DateTimeNullableFilter<"CbtClass"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"CbtClass"> | Date | string | null
  }

  export type CbtClassOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrderInput | SortOrder
    academicYear?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _relevance?: CbtClassOrderByRelevanceInput
  }

  export type CbtClassWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: CbtClassWhereInput | CbtClassWhereInput[]
    OR?: CbtClassWhereInput[]
    NOT?: CbtClassWhereInput | CbtClassWhereInput[]
    name?: StringFilter<"CbtClass"> | string
    grade?: StringNullableFilter<"CbtClass"> | string | null
    academicYear?: StringNullableFilter<"CbtClass"> | string | null
    isActive?: BoolFilter<"CbtClass"> | boolean
    createdAt?: DateTimeNullableFilter<"CbtClass"> | Date | string | null
    updatedAt?: DateTimeNullableFilter<"CbtClass"> | Date | string | null
  }, "id">

  export type CbtClassOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrderInput | SortOrder
    academicYear?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    _count?: CbtClassCountOrderByAggregateInput
    _avg?: CbtClassAvgOrderByAggregateInput
    _max?: CbtClassMaxOrderByAggregateInput
    _min?: CbtClassMinOrderByAggregateInput
    _sum?: CbtClassSumOrderByAggregateInput
  }

  export type CbtClassScalarWhereWithAggregatesInput = {
    AND?: CbtClassScalarWhereWithAggregatesInput | CbtClassScalarWhereWithAggregatesInput[]
    OR?: CbtClassScalarWhereWithAggregatesInput[]
    NOT?: CbtClassScalarWhereWithAggregatesInput | CbtClassScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"CbtClass"> | bigint | number
    name?: StringWithAggregatesFilter<"CbtClass"> | string
    grade?: StringNullableWithAggregatesFilter<"CbtClass"> | string | null
    academicYear?: StringNullableWithAggregatesFilter<"CbtClass"> | string | null
    isActive?: BoolWithAggregatesFilter<"CbtClass"> | boolean
    createdAt?: DateTimeNullableWithAggregatesFilter<"CbtClass"> | Date | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"CbtClass"> | Date | string | null
  }

  export type CbtUserCreateInput = {
    id?: bigint | number
    username: string
    name: string
    email?: string | null
    password: string
    role?: string
    classId?: bigint | number | null
    nisn?: string | null
    phone?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    deletedAt?: Date | string | null
  }

  export type CbtUserUncheckedCreateInput = {
    id?: bigint | number
    username: string
    name: string
    email?: string | null
    password: string
    role?: string
    classId?: bigint | number | null
    nisn?: string | null
    phone?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    deletedAt?: Date | string | null
  }

  export type CbtUserUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    username?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    classId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    nisn?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtUserUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    username?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    classId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    nisn?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtUserCreateManyInput = {
    id?: bigint | number
    username: string
    name: string
    email?: string | null
    password: string
    role?: string
    classId?: bigint | number | null
    nisn?: string | null
    phone?: string | null
    isActive?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    deletedAt?: Date | string | null
  }

  export type CbtUserUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    username?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    classId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    nisn?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtUserUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    username?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    classId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    nisn?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtClassCreateInput = {
    id?: bigint | number
    name: string
    grade?: string | null
    academicYear?: string | null
    isActive?: boolean
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type CbtClassUncheckedCreateInput = {
    id?: bigint | number
    name: string
    grade?: string | null
    academicYear?: string | null
    isActive?: boolean
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type CbtClassUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    academicYear?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtClassUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    academicYear?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtClassCreateManyInput = {
    id?: bigint | number
    name: string
    grade?: string | null
    academicYear?: string | null
    isActive?: boolean
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }

  export type CbtClassUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    academicYear?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CbtClassUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    grade?: NullableStringFieldUpdateOperationsInput | string | null
    academicYear?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CbtUserOrderByRelevanceInput = {
    fields: CbtUserOrderByRelevanceFieldEnum | CbtUserOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CbtUserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    classId?: SortOrder
    nisn?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type CbtUserAvgOrderByAggregateInput = {
    id?: SortOrder
    classId?: SortOrder
  }

  export type CbtUserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    classId?: SortOrder
    nisn?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type CbtUserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    classId?: SortOrder
    nisn?: SortOrder
    phone?: SortOrder
    isActive?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    deletedAt?: SortOrder
  }

  export type CbtUserSumOrderByAggregateInput = {
    id?: SortOrder
    classId?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type CbtClassOrderByRelevanceInput = {
    fields: CbtClassOrderByRelevanceFieldEnum | CbtClassOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CbtClassCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    academicYear?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CbtClassAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CbtClassMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    academicYear?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CbtClassMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    academicYear?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CbtClassSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | null
    notIn?: bigint[] | number[] | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}