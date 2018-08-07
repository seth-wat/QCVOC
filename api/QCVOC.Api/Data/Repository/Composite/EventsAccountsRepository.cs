namespace QCVOC.Server.Data.Repository.Composite
{
    using System.Data;
    using Dapper;
    using QCVOC.Api.Data.ConnectionFactory;
    using QCVOC.Server.Data.Model.Composite;

    public class EventsAccountsRepository : ICompositeRepository<EventsAccounts>
    {
        public EventsAccountsRepository(IDbConnectionFactory connectionFactory)
        {
            ConnectionFactory = connectionFactory;
        }

        private IDbConnectionFactory ConnectionFactory { get; }

        public EventsAccounts Add(EventsAccounts composite, IDbTransaction transaction = null)
        {
            var query = @"
                INSERT INTO EventsAccounts (
                    eventid,
                    accountid
                ) VALUES (
                    @eventid,
                    @accountid
                )
            ";

            var param = new
            {
                eventid = composite.EventId,
                acocuntid = composite.AccountId,
            };

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query, param, transaction);
            }

            return composite;
        }

        public void Remove(EventsAccounts composite, IDbTransaction transaction = null)
        {
            var query = @"
                DELETE
                FROM EventsAccounts
                WHERE eventid = @eventid
                AND accountid = @accountid
            ";

            var param = new
            {
                eventid = composite.EventId,
                acocuntid = composite.AccountId,
            };

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query, param, transaction);
            }
        }
    }
}