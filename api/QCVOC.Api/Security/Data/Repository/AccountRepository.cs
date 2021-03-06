// <copyright file="AccountRepository.cs" company="QC Coders (JP Dillingham, Nick Acosta, et. al.)">
//     Copyright (c) QC Coders (JP Dillingham, Nick Acosta, et. al.). All rights reserved. Licensed under the GPLv3 license. See LICENSE file
//     in the project root for full license information.
// </copyright>

namespace QCVOC.Api.Security.Data.Repository
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Dapper;
    using QCVOC.Api.Common;
    using QCVOC.Api.Common.Data.ConnectionFactory;
    using QCVOC.Api.Common.Data.Repository;
    using QCVOC.Api.Security.Data.Model;

    /// <summary>
    ///     Provides data access for <see cref="Account"/>.
    /// </summary>
    public class AccountRepository : ISingleKeyRepository<Account>
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="AccountRepository"/> class.
        /// </summary>
        /// <param name="connectionFactory">The database connection factory used for data access.</param>
        public AccountRepository(IDbConnectionFactory connectionFactory)
        {
            ConnectionFactory = connectionFactory;
        }

        private IDbConnectionFactory ConnectionFactory { get; }

        /// <summary>
        ///     Creates a new Account from the specified <paramref name="account"/>.
        /// </summary>
        /// <param name="account">The Account to create.</param>
        /// <returns>The created Account</returns>
        public Account Create(Account account)
        {
            var builder = new SqlBuilder();

            var query = builder.AddTemplate(@"
                INSERT INTO accounts
                    (id, name, passwordhash, passwordresetrequired, role, creationdate, creationbyid, lastupdatedate, lastupdatebyid, deleted)
                VALUES
                    (@id, @name, @passwordhash, @passwordresetrequired, @role, @creationdate, @creationbyid, @lastupdatedate, @lastupdatebyid, @deleted);
            ");

            builder.AddParameters(new
            {
                id = account.Id,
                name = account.Name,
                passwordhash = account.PasswordHash,
                passwordresetrequired = account.PasswordResetRequired,
                role = account.Role.ToString(),
                creationdate = account.CreationDate,
                creationbyid = account.CreationById,
                lastupdatedate = account.LastUpdateDate,
                lastupdatebyid = account.LastUpdateById,
                deleted = false,
            });

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query.RawSql, query.Parameters);
            }

            return Get(account.Id);
        }

        /// <summary>
        ///     Deletes the Account matching the specified <paramref name="id"/>.
        /// </summary>
        /// <param name="id">The id of the Account to delete.</param>
        public void Delete(Guid id)
        {
            var builder = new SqlBuilder();

            var query = builder.AddTemplate(@"
                UPDATE accounts
                SET 
                    deleted = true
                WHERE id = @id;
            ");

            builder.AddParameters(new { id });

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query.RawSql, query.Parameters);
            }
        }

        /// <summary>
        ///     Deletes the specified <paramref name="account"/>.
        /// </summary>
        /// <param name="account">The Account to delete.</param>
        public void Delete(Account account)
        {
            Delete(account.Id);
        }

        /// <summary>
        ///     Retrieves the Account with the specified <paramref name="id"/>.
        /// </summary>
        /// <param name="id">The id of the Account to retrieve.</param>
        /// <returns>The Account with the specified dd.</returns>
        public Account Get(Guid id)
        {
            return GetAll(new AccountFilters() { Id = id }).SingleOrDefault();
        }

        /// <summary>
        ///     Retrieves all Accounts after applying optional <paramref name="filters"/>.
        /// </summary>
        /// <param name="filters">Optional query filters.</param>
        /// <returns>A list of Accounts.</returns>
        public IEnumerable<Account> GetAll(Filters filters = null)
        {
            filters = filters ?? new Filters();
            var builder = new SqlBuilder();

            var query = builder.AddTemplate($@"
                SELECT
                    a1.id,
                    a1.name,
                    a1.passwordhash,
                    a1.passwordresetrequired,
                    a1.role,
                    a1.creationdate,
                    a1.creationbyid,
                    a3.name AS creationby,
                    a1.lastupdatedate,
                    a2.name AS lastupdateby,
                    a1.lastupdatebyid
                FROM accounts a1
                LEFT JOIN accounts a2 ON a1.lastupdatebyid = a2.id
                LEFT JOIN accounts a3 ON a1.creationbyid = a3.id
                /**where**/
                ORDER BY a1.name {filters.OrderBy.ToString()}
                LIMIT @limit OFFSET @offset
            ");

            builder.AddParameters(new
            {
                limit = filters.Limit,
                offset = filters.Offset,
                orderby = filters.OrderBy.ToString(),
            });

            builder.ApplyFilter(FilterType.Equals, "a1.deleted", false);

            if (filters is AccountFilters accountFilters)
            {
                builder
                    .ApplyFilter(FilterType.Equals, "a1.id", accountFilters.Id)
                    .ApplyFilter(FilterType.Equals, "a1.name", accountFilters.Name)
                    .ApplyFilter(FilterType.Equals, "a1.passwordresetrequired", accountFilters.PasswordResetRequired)
                    .ApplyFilter(FilterType.Equals, "a1.role", accountFilters.Role?.ToString())
                    .ApplyFilter(FilterType.Between, "a1.creationdate", accountFilters.CreationDateStart, accountFilters.CreationDateEnd)
                    .ApplyFilter(FilterType.Equals, "a1.creationbyid", accountFilters.CreationById)
                    .ApplyFilter(FilterType.Between, "a1.lastupdatedate", accountFilters.LastUpdateDateStart, accountFilters.LastUpdateDateEnd)
                    .ApplyFilter(FilterType.Equals, "a1.lastupdatebyid", accountFilters.LastUpdateById);
            }

            using (var db = ConnectionFactory.CreateConnection())
            {
                return db.Query<Account>(query.RawSql, query.Parameters);
            }
        }

        /// <summary>
        ///     Updates the specified <paramref name="account"/>.
        /// </summary>
        /// <param name="account">The Account to update.</param>
        /// <returns>The updated Account.</returns>
        public Account Update(Account account)
        {
            var builder = new SqlBuilder();

            var query = builder.AddTemplate(@"
                UPDATE accounts
                SET 
                    name = @name,
                    passwordhash = @passwordhash,
                    passwordresetrequired = @passwordresetrequired,
                    role = @role,
                    lastupdatedate = @lastupdatedate,
                    lastupdatebyid = @lastupdatebyid
                WHERE id = @id;
            ");

            builder.AddParameters(new
            {
                name = account.Name,
                passwordhash = account.PasswordHash,
                passwordresetrequired = account.PasswordResetRequired,
                role = account.Role.ToString(),
                id = account.Id,
                lastupdatedate = account.LastUpdateDate,
                lastupdatebyid = account.LastUpdateById,
            });

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query.RawSql, query.Parameters);
            }

            return Get(account.Id);
        }
    }
}