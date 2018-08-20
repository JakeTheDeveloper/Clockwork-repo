using System;
using Microsoft.AspNetCore.Mvc;
using Clockwork.API.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Server.Kestrel.Internal.System.Collections.Sequences;

namespace Clockwork.API.Controllers
{
    [Route("api/[controller]")]
    public class CurrentTimeController : Controller
    {
        // GET api/currenttime
        [HttpGet]
        public IActionResult Get()
        {
            var utcTime = DateTime.UtcNow;
            var serverTime = DateTime.Now;
            var ip = this.HttpContext.Connection.RemoteIpAddress.ToString();
            var local = TimeZoneInfo.Local;
            var returnVal = new CurrentTimeQuery
            {
                UTCTime = utcTime,
                ClientIp = ip,
                Time = serverTime,
                TimeZone = local.StandardName
            };

            using (var db = new ClockworkContext())
            {
                db.CurrentTimeQueries.Add(returnVal);
                var count = db.SaveChanges();
                Console.WriteLine("{0} records saved to database", count);
                
                Console.WriteLine();
                foreach (var CurrentTimeQuery in db.CurrentTimeQueries)
                {
                    Console.WriteLine(" - {0}", CurrentTimeQuery.UTCTime);
                }
            }

            return Ok(returnVal);
        }
        
        /// <summary>
        /// This function is used to grab the entire database and put it into a list
        /// </summary>
        /// <returns>A collection of all the CurrentTimeQuery objects created</returns>
        // GET api/getDB
        [HttpGet]
        [Route("~/api/getDB")]
        public IActionResult GetAll()
        {
            var returnVals = new List<CurrentTimeQuery>();
            using (var db = new ClockworkContext())
            {
                foreach (var CurrentTimeQuery in db.CurrentTimeQueries)
                {
                    returnVals.Add(CurrentTimeQuery);
                }
            }
            return Ok(returnVals);
        }

        /// <summary>
        /// Matches selected time zone with time zone from system time zones
        /// converts utc time using the selected time zone
        /// </summary>
        /// <param name="zone">The time zone selected by the user</param>
        /// <returns>DateTime object which contains converted time</returns>
        [HttpGet]
        [Route("~/api/TimeZone/{zone}")]
        public IActionResult GetZone(string zone)
        {
            var zoneTime = new DateTime();
            var utcTime = DateTime.UtcNow;
            foreach (TimeZoneInfo z in TimeZoneInfo.GetSystemTimeZones())
            {
                if (z.Id == zone)
                {
                    zoneTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(utcTime, z.Id);
                }
            }

            var returnVal = new CurrentTimeQuery
            {
                UTCTime = DateTime.UtcNow,
                ClientIp = this.HttpContext.Connection.RemoteIpAddress.ToString(),
                Time = zoneTime,
                TimeZone = zone
            };
          

            using (var db = new ClockworkContext())
            {
                db.CurrentTimeQueries.Add(returnVal);
                db.SaveChanges();
            }
            return Ok(returnVal);
        }

        /// <summary>
        /// GETs all system time zones and returns to the webpage in order to build out the drop down
        /// </summary>
        /// <returns>A collection of time zone strings</returns>
        [HttpGet]
        [Route("~/api/getTimeZoneCollection")]
        public IActionResult GetZoneCollection()
        {
            var timeZoneCollection = new List<string>();
            foreach (TimeZoneInfo z in TimeZoneInfo.GetSystemTimeZones())
            {
                timeZoneCollection.Add(z.Id);
            }
            return Ok(timeZoneCollection);
        }
    }
}
