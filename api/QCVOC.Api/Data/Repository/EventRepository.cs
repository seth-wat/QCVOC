﻿// <copyright file="EventRepository.cs" company="JP Dillingham, Nick Acosta, et. al.">
//     Copyright (c) JP Dillingham, Nick Acosta, et. al.. All rights reserved. Licensed under the GPLv3 license. See LICENSE file
//     in the project root for full license information.
// </copyright>

namespace QCVOC.Api.Data.Repository
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Dapper;
    using QCVOC.Api.Data.ConnectionFactory;
    using QCVOC.Api.Data.Model;
    using QCVOC.Api.Data.Model.Security;
    using QCVOC.Server.Data.Model.Composite;
    using QCVOC.Server.Data.Repository.Composite;

    public class EventRepository : IRepository<Event>
    {
        /// <summary>
        ///     Initializes a new instance of the <see cref="EventRepository"/> class.
        /// </summary>
        /// <param name="connectionFactory"></param>
        public EventRepository(
            IDbConnectionFactory connectionFactory,
            IRepository<Account> accountRepository,
            IRepository<Service> serviceRepository,
            ICompositeRepository<EventsAccounts> eventsAccountsRepository,
            ICompositeRepository<EventsServices> eventsServicesRepository)
        {
            ConnectionFactory = connectionFactory;
            AccountRepository = accountRepository;
            ServiceRepository = serviceRepository;
            EventsAccountsRepository = eventsAccountsRepository;
            EventsServicesRepository = eventsServicesRepository;
        }

        private IRepository<Account> AccountRepository { get; }
        private IDbConnectionFactory ConnectionFactory { get; }
        private ICompositeRepository<EventsAccounts> EventsAccountsRepository { get; }
        private ICompositeRepository<EventsServices> EventsServicesRepository { get; }
        private IRepository<Service> ServiceRepository { get; }

        public Event Create(Event newEvent)
        {
            var accounts = AccountRepository.GetAll();
            var unmatchedAccounts = newEvent.Hosts.
                Where(host => !accounts.Any(account => account == host))
                .Any();

            if (unmatchedAccounts)
            {
                throw new ArgumentException("The specified Event contains unknown Accounts.", nameof(newEvent));
            }

            var services = ServiceRepository.GetAll();
            var unmatchedServices = newEvent.Services.
                Where(service => !services.Any(svc => svc == service))
                .Any();

            if (unmatchedServices)
            {
                throw new ArgumentException("The specified Event contains unknown Services.", nameof(newEvent));
            }

            using (var db = ConnectionFactory.CreateConnection())
            using (var tx = db.BeginTransaction())
            {
                // insert event record
                var query = @"
                    INSERT INTO Events (
                        endtime,
                        id,
                        name,
                        starttime
                    ) VALUES (
                        @endtime,
                        @id,
                        @name,
                        @starttime
                    )
                ";

                var param = new
                {
                    endtime = newEvent.EndTime,
                    id = newEvent.Id,
                    name = newEvent.Name,
                    starttime = newEvent.StartTime
                };

                db.Execute(query, param, tx);

                // insert hosts
                foreach (var account in accounts)
                {
                    EventsAccountsRepository.Add(new EventsAccounts { EventId = newEvent.Id, AccountId = account.Id }, tx);
                }

                foreach (var service in services)
                {
                    EventsServicesRepository.Add(new EventsServices { EventId = newEvent.Id, ServiceId = service.Id }, tx);
                }

                tx.Commit();

                var inserted = Get(newEvent.Id);
                return inserted;
            }
        }

        public void Delete(Guid id)
        {
            using (var db = ConnectionFactory.CreateConnection())
            {
                var query = @"
                    DELETE
                    FROM Events
                    WHERE id = @id;
                ";

                var param = new { id };
                db.Execute(query, param);
            }
        }

        public void Delete(Event deletedEvent)
        {
            if (deletedEvent == null)
            {
                throw new ArgumentException("Event cannot be null.", nameof(deletedEvent));
            }

            Delete(deletedEvent.Id);
        }

        public Event Get(Guid id)
        {
            using (var db = ConnectionFactory.CreateConnection())
            {
                var query = @"
                    SELECT
                        id,
                        name,
                        limit
                    FROM Events
                    WHERE id = @id;
                ";

                var param = new { id };

                return db.QueryFirstOrDefault<Event>(query, param);
            }
        }

        public IEnumerable<Event> GetAll()
        {
            using (var db = ConnectionFactory.CreateConnection())
            {
                var query = @"
                    SELECT
                        id,
                        name,
                        limit
                    FROM Events
                    WHERE id = @id;
                ";

                return db.Query<Event>(query);
            }
        }

        public Event Update(Event updatedEvent)
        {
            using (var db = ConnectionFactory.CreateConnection())
            {
                var query = @"
                    UPDATE Events
                    SET
                        id = @id,
                        name = @name,
                        limit = @limit
                    WHERE id = @id
                ";

                var param = new
                {
                    endtime = updatedEvent.EndTime,
                    id = updatedEvent.Id,
                    name = updatedEvent.Name,
                    starttime = updatedEvent.StartTime
                };

                db.Execute(query, param);

                return Get(updatedEvent.Id);
            }
        }
    }
}